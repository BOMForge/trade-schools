# Cloudflare Pages Setup Guide

## Step 1: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 2: Create D1 Database

```bash
wrangler d1 create trade-schools-db
```

**Important**: After running this, copy the `database_id` from the output and paste it into `wrangler.toml` on line 7.

## Step 3: Execute Database Schema

```bash
wrangler d1 execute trade-schools-db --file=schema.sql
```

This creates all the tables for school submissions.

## Step 4: Set Up Email Service (Resend.com)

1. Go to https://resend.com and create a free account
2. Get your API key from the dashboard
3. Set it as a secret:

```bash
wrangler pages secret put RESEND_API_KEY
# When prompted, paste your Resend API key
```

## Step 5: Set Up reCAPTCHA

1. Go to https://www.google.com/recaptcha/admin/create
2. Create a new reCAPTCHA v3 site
3. Add your domain (e.g., yourdomain.com)
4. Copy the **Site Key** and update it in:
   - `form-submission.js` line 6
   - `clean-map.html` line 24
5. Copy the **Secret Key** and set it:

```bash
wrangler pages secret put RECAPTCHA_SECRET_KEY
# When prompted, paste your reCAPTCHA secret key
```

## Step 6: Deploy to Cloudflare Pages

### Option A: Via Wrangler CLI

```bash
wrangler pages deploy . --project-name=trade-schools-map
```

### Option B: Via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to Pages
3. Click "Create a project"
4. Connect your GitHub repository
5. Set build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
6. Add environment variables in dashboard:
   - `RESEND_API_KEY`
   - `RECAPTCHA_SECRET_KEY`

## Step 7: Bind D1 Database to Pages

In your Cloudflare Pages project settings:
1. Go to Settings > Functions
2. Scroll to D1 database bindings
3. Add binding:
   - Variable name: `DB`
   - D1 database: `trade-schools-db`

## Step 8: Test the Setup

1. Go to your deployed site
2. Try submitting a test school
3. Check:
   - Database has the entry: `wrangler d1 execute trade-schools-db --command="SELECT * FROM pending_schools"`
   - Email was received at tom@bomforge.com

## Troubleshooting

### Email not sending?
- Check Resend dashboard for logs
- Verify API key is correct
- Check `functions/api/schools/submit.ts` line 305 for correct sender email

### Database errors?
- Verify D1 binding is set up correctly
- Check schema was executed: `wrangler d1 execute trade-schools-db --command="SELECT name FROM sqlite_master WHERE type='table'"`

### reCAPTCHA failing?
- Make sure site key matches in frontend files
- Verify secret key is set correctly
- Check domain is authorized in reCAPTCHA console

## Quick Reference Commands

```bash
# View pending submissions
wrangler d1 execute trade-schools-db --command="SELECT school_name, city, state, submitted_at FROM pending_schools ORDER BY submitted_at DESC LIMIT 10"

# Approve a school (get ID from above query)
wrangler d1 execute trade-schools-db --command="UPDATE pending_schools SET status='approved' WHERE id='SCHOOL_ID_HERE'"

# View all secrets
wrangler pages secret list

# Update a secret
wrangler pages secret put SECRET_NAME
```

## Email Configuration

The system sends emails to `tom@bomforge.com`. To change this:
1. Edit `functions/api/schools/submit.ts` line 306
2. Update the `to` field with your email
3. Redeploy








