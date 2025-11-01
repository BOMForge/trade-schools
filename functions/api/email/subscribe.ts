import type { PagesFunction, EventContext, D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  RECAPTCHA_SECRET_KEY?: string;
}

interface EmailRequest {
  email: string;
  source?: string;
  recaptchaToken?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generate unique ID
function generateId(): string {
  return `email-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });
    
    const data = await response.json() as { success: boolean; score?: number };
    return data.success && (!data.score || data.score >= 0.5);
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if DB binding is available
  if (!env.DB) {
    console.error('Database binding not available');
    return new Response(
      JSON.stringify({ 
        error: 'Database not configured',
        details: 'Database binding is missing'
      }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    // Parse request body
    const body = await request.json() as EmailRequest;
    const { email, source = 'map', recaptchaToken } = body;

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify reCAPTCHA if configured
    if (env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken, env.RECAPTCHA_SECRET_KEY);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA verification failed' }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Get client info
    const clientIp = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Check if email already exists
    const existingEmail = await env.DB.prepare(
      'SELECT id, unsubscribed FROM email_subscribers WHERE email = ?'
    ).bind(email).first();

    if (existingEmail) {
      if (existingEmail.unsubscribed) {
        // Resubscribe
        await env.DB.prepare(
          'UPDATE email_subscribers SET unsubscribed = FALSE, unsubscribed_at = NULL, source = ?, ip_address = ?, user_agent = ? WHERE email = ?'
        ).bind(source, clientIp, userAgent, email).run();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Successfully resubscribed!',
            resubscribed: true 
          }),
          { status: 200, headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email already subscribed',
            existing: true 
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // Insert new subscriber
    const id = generateId();
    const timestamp = new Date().toISOString();

    try {
      const result = await env.DB.prepare(
        `INSERT INTO email_subscribers 
         (id, email, source, subscribed_at, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, email, source, timestamp, clientIp, userAgent, timestamp).run();

      // Log the subscription
      console.log(`New email subscriber: ${email} from ${source}`, result);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Successfully subscribed!',
          id: id 
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      // If it's a unique constraint error, treat as already subscribed
      if (dbError instanceof Error && dbError.message.includes('UNIQUE constraint')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email already subscribed',
            existing: true 
          }),
          { status: 200, headers: corsHeaders }
        );
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error('Email subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error && error.stack ? error.stack : 'Unknown error';
    
    // Log full error for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: errorDetails,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process subscription',
        details: errorMessage,
        // Only include details in development (don't expose stack traces in production)
        ...(process.env.NODE_ENV === 'development' ? { debug: errorDetails } : {})
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};


