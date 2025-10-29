/**
 * Cloudflare Pages Function for submitting trade schools
 * API Endpoint: POST /api/schools/submit
 */

import { z } from 'zod';

// US State codes
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

// Approved trade programs
const APPROVED_PROGRAMS = [
  'Welding',
  'Diesel & Automotive Technology',
  'HVAC (Heating, Ventilation, and Air Conditioning)',
  'Machine Tool Technology & Mechanical Systems',
  'Construction & Building Technology',
  'Electronics Technology',
  'CAD/CAM Drafting & Design',
  'Plumbing & Pipefitting',
  'Woodworking & Carpentry',
  'Electrical Technology',
  'Industrial Maintenance',
  'Machining & CNC',
  'Robotics & Automation',
  'Manufacturing Technology',
  'Other'
] as const;

// Validation schema for school submission
export const SchoolSubmissionSchema = z.object({
  // Required fields
  schoolName: z.string()
    .min(2, 'School name must be at least 2 characters')
    .max(100, 'School name must be less than 100 characters')
    .trim(),

  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters')
    .trim(),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .trim(),

  state: z.enum(US_STATES, {
    errorMap: () => ({ message: 'Please select a valid US state' })
  }),

  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .trim(),

  contactEmail: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  phone: z.string()
    .regex(/^[\d\s\-\(\)]+$/, 'Phone number can only contain digits, spaces, dashes, and parentheses')
    .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
    .refine((val) => val.length === 10, 'Phone number must be 10 digits')
    .transform((val) => `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`), // Format: (123) 456-7890

  programs: z.array(z.string())
    .min(1, 'Please select at least one program')
    .max(10, 'Maximum 10 programs can be selected'),

  // Optional fields
  website: z.string()
    .url('Please enter a valid website URL')
    .transform((val) => {
      // Auto-prepend https:// if missing
      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    })
    .optional()
    .or(z.literal('')),

  programOther: z.string()
    .max(100, 'Other program description must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  schoolDescription: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),

  submitterName: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // reCAPTCHA token
  recaptchaToken: z.string()
    .min(1, 'reCAPTCHA verification required')
});

export type SchoolSubmission = z.infer<typeof SchoolSubmissionSchema>;

// Rate limiting helper
interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5; // Max 5 submissions per IP
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Reset if window expired
  if (now - entry.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  // Check limit
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  // Increment
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Verify reCAPTCHA
async function verifyRecaptcha(token: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secret}&response=${token}`,
    });

    const data = await response.json() as { success: boolean; score?: number };

    // For reCAPTCHA v3, check score (0.0 - 1.0, higher is better)
    if (data.success && data.score !== undefined) {
      return data.score >= 0.5; // Threshold for bot detection
    }

    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Check for duplicate submissions
async function checkDuplicate(
  env: any,
  schoolName: string,
  address: string,
  city: string,
  state: string
): Promise<boolean> {
  try {
    // Query pending_schools collection
    const pendingSchools = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM pending_schools WHERE LOWER(school_name) = LOWER(?) AND LOWER(city) = LOWER(?) AND state = ?'
    ).bind(schoolName, city, state).first();

    if (pendingSchools && pendingSchools.count > 0) {
      return true;
    }

    // Query approved_schools collection
    const approvedSchools = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM approved_schools WHERE LOWER(school_name) = LOWER(?) AND LOWER(city) = LOWER(?) AND state = ?'
    ).bind(schoolName, city, state).first();

    return approvedSchools && approvedSchools.count > 0;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return false; // Allow submission if check fails
  }
}

// Send email notification
async function sendNotificationEmail(env: any, submission: SchoolSubmission): Promise<void> {
  try {
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1d9bf0; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; }
    .programs { display: inline-block; background: #1d9bf0; color: white; padding: 5px 10px; border-radius: 5px; margin: 3px; }
    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🏫 New Trade School Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">School Name:</div>
        <div class="value">${submission.schoolName}</div>
      </div>

      <div class="field">
        <div class="label">Address:</div>
        <div class="value">
          ${submission.streetAddress}<br>
          ${submission.city}, ${submission.state} ${submission.zipCode}
        </div>
      </div>

      <div class="field">
        <div class="label">Contact Information:</div>
        <div class="value">
          📧 ${submission.contactEmail}<br>
          📞 ${submission.phone}
        </div>
      </div>

      ${submission.website ? `
      <div class="field">
        <div class="label">Website:</div>
        <div class="value"><a href="${submission.website}">${submission.website}</a></div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Programs Offered:</div>
        <div class="value">
          ${submission.programs.map(p => `<span class="programs">${p}</span>`).join(' ')}
        </div>
      </div>

      ${submission.programOther ? `
      <div class="field">
        <div class="label">Other Programs:</div>
        <div class="value">${submission.programOther}</div>
      </div>
      ` : ''}

      ${submission.schoolDescription ? `
      <div class="field">
        <div class="label">Description:</div>
        <div class="value">${submission.schoolDescription}</div>
      </div>
      ` : ''}

      ${submission.submitterName ? `
      <div class="field">
        <div class="label">Submitted by:</div>
        <div class="value">${submission.submitterName}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Submitted at:</div>
        <div class="value">${new Date().toLocaleString()}</div>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from the Trade Schools Directory submission system.
    </div>
  </div>
</body>
</html>
    `.trim();

    // Use Cloudflare Email Workers or SendGrid/Resend
    // This is a placeholder - you'll need to configure your email service
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Trade Schools Directory <submissions@bomforge.com>',
        to: 'tom@bomforge.com',
        subject: `New School Submission: ${submission.schoolName}`,
        html: emailBody,
      }),
    });
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - submission should succeed even if email fails
  }
}

// Main handler
export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Maximum 5 submissions per 24 hours.',
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
        },
      });
    }

    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = SchoolSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const submission = validationResult.data;

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(
      submission.recaptchaToken,
      env.RECAPTCHA_SECRET_KEY
    );

    if (!recaptchaValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.',
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check for duplicates
    const isDuplicate = await checkDuplicate(
      env,
      submission.schoolName,
      submission.streetAddress,
      submission.city,
      submission.state
    );

    if (isDuplicate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This school appears to already be in our database or pending review.',
      }), {
        status: 409,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Store in database (pending_schools table)
    const submissionId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO pending_schools (
        id, school_name, street_address, city, state, zip_code,
        contact_email, phone, website, programs, program_other,
        school_description, submitter_name, submitted_at, client_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      submission.schoolName,
      submission.streetAddress,
      submission.city,
      submission.state,
      submission.zipCode,
      submission.contactEmail,
      submission.phone,
      submission.website || null,
      JSON.stringify(submission.programs),
      submission.programOther || null,
      submission.schoolDescription || null,
      submission.submitterName || null,
      new Date().toISOString(),
      clientIP
    ).run();

    // Send notification email
    await sendNotificationEmail(env, submission);

    // Return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you! Your school submission has been received and is pending review.',
      submissionId,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });

  } catch (error) {
    console.error('Submission error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}
