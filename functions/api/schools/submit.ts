/**
 * Cloudflare Pages Function for submitting trade schools (relaxed validation)
 * API Endpoint: POST /api/schools/submit
 */

import { z } from 'zod';

// US State codes (used for light validation only when provided)
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
] as const;

// Relaxed validation schema: only schoolName is required
export const SchoolSubmissionSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters').max(150).trim(),

  streetAddress: z.string().max(200).trim().optional().or(z.literal('')),
  city: z.string().max(100).trim().optional().or(z.literal('')),
  state: z.enum(US_STATES).optional().or(z.literal('')),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 12345 or 12345-6789').optional().or(z.literal('')),

  contactEmail: z.string().email('Enter a valid email').toLowerCase().trim().optional().or(z.literal('')),

  phone: z.string()
    .transform((val) => (val ? val.replace(/\D/g, '') : ''))
    .refine((val) => val === '' || val.length === 10, 'Phone must be 10 digits')
    .transform((val) => (val && val.length === 10 ? `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}` : ''))
    .optional()
    .or(z.literal('')),

  website: z.string()
    .transform((val) => {
      if (!val) return '';
      if (!val.startsWith('http://') && !val.startsWith('https://')) return `https://${val}`;
      return val;
    })
    .optional()
    .or(z.literal('')),

  programs: z.array(z.string()).max(10).default([]),
  programOther: z.string().max(200).optional().or(z.literal('')),
  schoolDescription: z.string().max(1000).optional().or(z.literal('')),
  submitterName: z.string().max(100).optional().or(z.literal('')),

  // reCAPTCHA is optional; if provided and secret exists, we verify
  recaptchaToken: z.string().optional().or(z.literal('')),
});

export type SchoolSubmission = z.infer<typeof SchoolSubmissionSchema>;

interface RateLimitEntry { count: number; firstRequest: number }
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 20; // relaxed
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (now - entry.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

async function verifyRecaptchaIfPresent(token: string | undefined, secret?: string): Promise<boolean> {
  if (!token || !secret) return true; // skip if not configured
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });
    const data = (await response.json()) as { success: boolean; score?: number };
    if (data.success && data.score !== undefined) return data.score >= 0.5;
    return data.success;
  } catch {
    return true; // do not block on verification errors
  }
}

export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rate = checkRateLimit(clientIP);
    if (!rate.allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const parsed = SchoolSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ success: false, error: 'Validation failed', errors: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const submission = parsed.data;

    // reCAPTCHA (optional)
    const captchaOk = await verifyRecaptchaIfPresent(submission.recaptchaToken, env.RECAPTCHA_SECRET_KEY);
    if (!captchaOk) {
      return new Response(JSON.stringify({ success: false, error: 'reCAPTCHA verification failed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Duplicate check only if we have enough info (name + city/state)
    if (submission.city && submission.state) {
      try {
        const dup = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM pending_schools WHERE LOWER(school_name) = LOWER(?) AND LOWER(city) = LOWER(?) AND state = ?'
        ).bind(submission.schoolName, submission.city, submission.state).first();
        const dup2 = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM approved_schools WHERE LOWER(school_name) = LOWER(?) AND LOWER(city) = LOWER(?) AND state = ?'
        ).bind(submission.schoolName, submission.city, submission.state).first();
        if ((dup && dup.count > 0) || (dup2 && dup2.count > 0)) {
          return new Response(JSON.stringify({ success: false, error: 'Potential duplicate found.' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {}
    }

    // Persist to D1 (use empty strings for NOT NULL columns if missing)
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO pending_schools (
        id, school_name, street_address, city, state, zip_code,
        contact_email, phone, website, programs, program_other,
        school_description, submitter_name, submitted_at, client_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      submission.schoolName,
      submission.streetAddress || '',
      submission.city || '',
      submission.state || '',
      submission.zipCode || '',
      submission.contactEmail || '',
      submission.phone || '',
      submission.website || null,
      JSON.stringify(submission.programs || []),
      submission.programOther || null,
      submission.schoolDescription || null,
      submission.submitterName || null,
      new Date().toISOString(),
      clientIP
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Thanks! Submission received and pending review.', submissionId: id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-RateLimit-Remaining': rate.remaining.toString() },
    });
  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}


