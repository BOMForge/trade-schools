/**
 * Cloudflare Pages Function for employer job postings
 * API Endpoint: POST /api/employers/submit
 */

import { z } from 'zod';

// Validation schema for employer submission
export const EmployerSubmissionSchema = z.object({
  companyName: z.string().min(2).max(100).trim(),
  contactName: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string()
    .regex(/^[\d\s\-\(\)]+$/, 'Invalid phone format')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, 'Phone must be 10 digits')
    .transform((val) => `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().min(3).max(100).trim(),
  skills: z.array(z.string()).min(1, 'Select at least one skill').max(20),
  otherSkill: z.string().max(100).optional().or(z.literal('')),
  positions: z.coerce.number().int().min(1).max(999),
  jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Apprenticeship', 'Internship']),
  description: z.string().min(10).max(1000).trim(),
  salary: z.string().max(100).optional().or(z.literal('')),
  additionalInfo: z.string().max(500).optional().or(z.literal('')),
});

export type EmployerSubmission = z.infer<typeof EmployerSubmissionSchema>;

// Send email notification
async function sendEmployerNotification(env: any, submission: EmployerSubmission): Promise<void> {
  try {
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; }
    .skill-tag { display: inline-block; background: #28a745; color: white; padding: 5px 10px; border-radius: 5px; margin: 3px; }
    .description-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🏭 New Employer Job Posting</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Company:</div>
        <div class="value"><strong>${submission.companyName}</strong></div>
      </div>

      <div class="field">
        <div class="label">Contact Person:</div>
        <div class="value">${submission.contactName}</div>
      </div>

      <div class="field">
        <div class="label">Contact Information:</div>
        <div class="value">
          📧 ${submission.email}<br>
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
        <div class="label">Location:</div>
        <div class="value">${submission.location}</div>
      </div>

      <div class="field">
        <div class="label">Skills/Trades Needed:</div>
        <div class="value">
          ${submission.skills.map(s => `<span class="skill-tag">${s}</span>`).join(' ')}
          ${submission.otherSkill ? `<br><small>Other: ${submission.otherSkill}</small>` : ''}
        </div>
      </div>

      <div class="field">
        <div class="label">Positions Available:</div>
        <div class="value">${submission.positions} position(s)</div>
      </div>

      <div class="field">
        <div class="label">Job Type:</div>
        <div class="value">${submission.jobType}</div>
      </div>

      ${submission.salary ? `
      <div class="field">
        <div class="label">Salary Range:</div>
        <div class="value">${submission.salary}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Job Description:</div>
        <div class="description-box">${submission.description}</div>
      </div>

      ${submission.additionalInfo ? `
      <div class="field">
        <div class="label">Additional Information:</div>
        <div class="value">${submission.additionalInfo}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Submitted at:</div>
        <div class="value">${new Date().toLocaleString()}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Trade Schools Jobs <jobs@bomforge.com>',
        to: 'tom@bomforge.com',
        subject: `New Job Posting: ${submission.companyName} - ${submission.positions} ${submission.jobType} position(s)`,
        html: emailBody,
      }),
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

// Main handler
export async function onRequestPost(context: any): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const validationResult = EmployerSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const submission = validationResult.data;

    // Store in database
    const submissionId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO employer_submissions (
        id, company_name, contact_name, email, phone, website, location,
        skills, other_skill, positions, job_type, description, salary,
        additional_info, submitted_at, client_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      submission.companyName,
      submission.contactName,
      submission.email,
      submission.phone,
      submission.website || null,
      submission.location,
      JSON.stringify(submission.skills),
      submission.otherSkill || null,
      submission.positions,
      submission.jobType,
      submission.description,
      submission.salary || null,
      submission.additionalInfo || null,
      new Date().toISOString(),
      request.headers.get('CF-Connecting-IP') || 'unknown'
    ).run();

    // Send notification
    await sendEmployerNotification(env, submission);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you! We will review your job posting and connect you with qualified candidates.',
      submissionId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}


