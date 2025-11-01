# 🚀 Quick Setup Instructions

## What's Been Created:

✅ **Database Schema** (`schema.sql`)
- Tables for school submissions
- Tables for employer job postings
- Admin users table
- Audit logging

✅ **Employer Hiring Form** (`employer-hiring.html`)
- Simple form for companies to post jobs
- Connects with trade schools
- Email notifications to you

✅ **API Endpoints**
- `/api/schools/submit` - School submissions
- `/api/employers/submit` - Job postings

## Two Ways to Set Up:

### Option 1: Automated Script (Recommended)

```bash
./QUICK-START.sh
```

This will walk you through everything!

### Option 2: Manual Setup

1. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

2. **Create Database**
   ```bash
   wrangler d1 create trade-schools-db
   ```
   Copy the `database_id` and paste it into `wrangler.toml` line 7

3. **Create Tables**
   ```bash
   wrangler d1 execute trade-schools-db --file=schema.sql
   ```

4. **Get Your Keys**
   - Resend: https://resend.com (free email sending)
   - reCAPTCHA: https://www.google.com/recaptcha/admin

5. **Set Secrets**
   ```bash
   wrangler pages secret put RESEND_API_KEY
   wrangler pages secret put RECAPTCHA_SECRET_KEY
   ```

6. **Update Frontend Files**
   - `form-submission.js` line 6: Add reCAPTCHA site key
   - `clean-map.html` line 24: Add reCAPTCHA site key

7. **Deploy**
   ```bash
   wrangler pages deploy . --project-name=trade-schools-map
   ```

8. **Bind Database (in Cloudflare Dashboard)**
   - Go to Pages > Your Project > Settings > Functions
   - Add D1 binding: `DB` → `trade-schools-db`

## Test It Out:

1. **School Submission Form**: Visit your site and submit a test school
2. **Employer Form**: Visit `/employer-hiring.html` and submit a test job

Both will:
- Save to database ✅
- Send you an email ✅
- Show confirmation to user ✅

## Check Your Data:

```bash
# View pending schools
wrangler d1 execute trade-schools-db --command="SELECT * FROM pending_schools"

# View job postings
wrangler d1 execute trade-schools-db --command="SELECT * FROM employer_submissions"
```

## Files Created:

- `wrangler.toml` - Cloudflare configuration
- `schema.sql` - Database tables (updated with employer table)
- `employer-hiring.html` - Job posting form
- `functions/api/employers/submit.ts` - Employer API endpoint
- `CLOUDFLARE-SETUP.md` - Detailed setup guide
- `QUICK-START.sh` - Automated setup script

## Need Help?

See `CLOUDFLARE-SETUP.md` for detailed troubleshooting and configuration options.

---

## What Each Form Does:

### School Submission Form (existing)
- Trade schools submit their info
- Goes to `pending_schools` table
- Email sent to tom@bomforge.com
- You review and approve

### Employer Hiring Form (new!)
- Companies post job openings
- Goes to `employer_submissions` table  
- Email sent to tom@bomforge.com
- You connect them with schools

**Both save to database AND send email!** 🎉








