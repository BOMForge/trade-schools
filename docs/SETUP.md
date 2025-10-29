# Complete Setup Guide

This guide walks you through setting up the Trade Schools Directory platform from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup (Automated)](#quick-setup-automated)
3. [Manual Setup](#manual-setup)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

### Required Services
- **Cloudflare Account** (free tier works)
- **Google reCAPTCHA v3** account
- **Email Service** (Resend recommended, 3k emails/month free)

### Required Tools
```bash
# Node.js 18+
node --version  # Should be 18.0.0 or higher

# Wrangler CLI
npm install -g wrangler

# Git
git --version
```

## Quick Setup (Automated)

### Option 1: One-Command Setup

```bash
# Run automated setup script
./QUICK-START.sh
```

This script will:
- ✅ Install dependencies
- ✅ Create Cloudflare D1 database
- ✅ Initialize database schema
- ✅ Prompt for API keys
- ✅ Configure environment variables
- ✅ Deploy to Cloudflare Pages

## Manual Setup

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

This opens your browser to authenticate with Cloudflare.

### Step 2: Create D1 Database

```bash
cd /Users/tc/workspace/TradeSchools

# Create database
wrangler d1 create trade-schools-db
```

**Save the output!** You'll see something like:
```
✅ Successfully created DB 'trade-schools-db'
database_id = "xxxx-xxxx-xxxx-xxxx"
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "trade-schools-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

### Step 3: Initialize Database Schema

```bash
wrangler d1 execute trade-schools-db --file=schema.sql
```

Verify tables were created:
```bash
wrangler d1 execute trade-schools-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see:
- `pending_schools`
- `approved_schools`
- `employer_submissions`
- `admin_users`
- `submission_audit_log`

### Step 4: Set Up Google reCAPTCHA v3

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin/create)
2. Click "+" to create a new site
3. Configure:
   - **Label:** Trade Schools Directory
   - **reCAPTCHA type:** Score based (v3)
   - **Domains:** 
     - `localhost` (for testing)
     - `trade-schools.pages.dev`
     - Your custom domain (if any)
4. Click "Submit"
5. **Save these keys:**
   - **Site Key** (public): Use in frontend
   - **Secret Key** (private): Use in backend

### Step 5: Set Up Email Service (Resend)

1. Sign up at [Resend.com](https://resend.com/)
2. Verify your email
3. In dashboard, create API key
4. Save the API key

**Alternative Email Services:**
- SendGrid: https://sendgrid.com/
- Mailgun: https://www.mailgun.com/
- AWS SES: https://aws.amazon.com/ses/

### Step 6: Configure Environment Variables

```bash
# Set reCAPTCHA secret
wrangler pages secret put RECAPTCHA_SECRET_KEY
# Paste your reCAPTCHA secret key when prompted

# Set Resend API key
wrangler pages secret put RESEND_API_KEY
# Paste your Resend API key when prompted
```

Verify secrets are set:
```bash
wrangler pages secret list --project-name=trade-schools
```

### Step 7: Update Frontend Configuration

#### A. Update `src/map.html`

Find line ~24 and update reCAPTCHA site key:
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY"></script>
```

Replace `YOUR_RECAPTCHA_SITE_KEY` with your actual site key.

#### B. Update `src/assets/js/form-submission.js`

Find line ~6 and update:
```javascript
const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY';
```

#### C. Update Email Address

In `functions/api/schools/submit.ts`, line ~306:
```typescript
to: 'tom@bomforge.com',  // Change to your email
```

In `functions/api/employers/submit.ts`, update the same.

### Step 8: Deploy to Cloudflare Pages

```bash
wrangler pages deploy src/ --project-name=trade-schools
```

### Step 9: Bind D1 Database to Pages

**In Cloudflare Dashboard:**
1. Go to https://dash.cloudflare.com
2. Navigate to **Pages** > **trade-schools**
3. Go to **Settings** > **Functions**
4. Scroll to **D1 database bindings**
5. Click **Add binding**
   - Variable name: `DB`
   - D1 database: `trade-schools-db`
6. Click **Save**

## Configuration

### Database Settings

View pending submissions:
```bash
wrangler d1 execute trade-schools-db --command="
  SELECT school_name, city, state, status, submitted_at 
  FROM pending_schools 
  WHERE status='pending' 
  ORDER BY submitted_at DESC 
  LIMIT 10
"
```

Approve a school:
```bash
wrangler d1 execute trade-schools-db --command="
  UPDATE pending_schools 
  SET status='approved', reviewed_at=datetime('now'), reviewed_by='admin' 
  WHERE id='SCHOOL_ID_HERE'
"
```

### Rate Limiting

Default: 5 submissions per IP per 24 hours

To change, edit `functions/api/schools/submit.ts`:
```typescript
const RATE_LIMIT_MAX = 10;  // Change to desired max
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;  // 24 hours
```

### Validation Rules

Modify validation in `functions/api/schools/submit.ts` (Zod schema):
```typescript
schoolName: z.string()
  .min(2, 'School name must be at least 2 characters')
  .max(100, 'School name must be less than 100 characters')
  .trim(),
```

### Data File Paths

Production data is stored in `data/production/`:
- `trade_schools_geocoded_fixed.csv` - Main school data
- `matchmaking_index.csv` - Program matching data

Update paths in `src/map.html` if needed:
```javascript
const DATA_PATHS = [
  '../data/production/trade_schools_geocoded_fixed.csv',
  'data/production/trade_schools_geocoded_fixed.csv',
  '/data/production/trade_schools_geocoded_fixed.csv'
];
```

## Testing

### Local Testing

```bash
# Start local development server
wrangler pages dev src/ --d1 DB=trade-schools-db --port 8080

# Open in browser
open http://localhost:8080
```

### Test Checklist

- [ ] Landing page loads at `/`
- [ ] Interactive map loads at `/map.html`
- [ ] CSV data loads successfully (check console)
- [ ] School markers appear on map
- [ ] Filters work (state, program)
- [ ] Hex grid visualizations display
- [ ] Submit form opens
- [ ] Form validation works
- [ ] Form submission succeeds
- [ ] Email notification received
- [ ] Database stores submission

### Test Form Submission

1. Open `/map.html`
2. Click "Submit a School"
3. Fill required fields:
   - School Name: "Test Technical Institute"
   - Street Address: "123 Main St"
   - City: "Los Angeles"
   - State: "CA"
   - ZIP: "90001"
   - Email: "test@example.com"
   - Phone: "(555) 123-4567"
   - Programs: Select at least one
4. Click "Submit School"
5. Verify:
   - Success message appears
   - Form resets
   - Email received
   - Database has entry

### Test Database

```bash
# View submitted schools
wrangler d1 execute trade-schools-db --command="
  SELECT * FROM pending_schools ORDER BY submitted_at DESC LIMIT 1
"
```

### Test API Endpoint

```bash
curl -X POST http://localhost:8080/api/schools/submit \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test School",
    "streetAddress": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "contactEmail": "test@example.com",
    "phone": "(555) 123-4567",
    "programs": ["Welding"],
    "recaptchaToken": "test-token"
  }'
```

## Troubleshooting

### Issue: CSV Files Not Loading

**Symptoms:**
- Map shows "0 Schools"
- Console shows "Failed to load CSV"

**Solutions:**

1. Check file paths in browser console
2. Verify files exist in `data/production/`
3. Check Cloudflare Pages deployment includes data files
4. Test direct file access: `https://your-site.pages.dev/data/production/trade_schools_geocoded_fixed.csv`

```bash
# Ensure data files are committed
git add data/production/*.csv
git commit -m "Add production data files"
git push
```

### Issue: Form Doesn't Submit

**Symptoms:**
- Button shows loading but nothing happens
- Console shows errors

**Solutions:**

1. Check browser console for errors
2. Verify reCAPTCHA keys are correct
3. Check API endpoint in Network tab
4. Verify D1 binding is configured

```bash
# Check deployment logs
wrangler pages deployment tail --project-name=trade-schools

# Verify secrets
wrangler pages secret list --project-name=trade-schools
```

### Issue: Database Errors

**Symptoms:**
- API returns 500 errors
- "Database binding not found"

**Solutions:**

1. Verify D1 binding in Cloudflare dashboard
2. Check `wrangler.toml` has correct database_id
3. Ensure schema was executed

```bash
# Test database connection
wrangler d1 execute trade-schools-db --command="SELECT 1"

# Re-run schema if needed
wrangler d1 execute trade-schools-db --file=schema.sql
```

### Issue: Emails Not Sending

**Symptoms:**
- Form submits but no email received
- API logs show email errors

**Solutions:**

1. Check Resend dashboard for delivery status
2. Verify API key is correct
3. Check sender email domain is verified
4. Review email logs

```bash
# Check if secret is set
wrangler pages secret list

# Update secret if needed
wrangler pages secret put RESEND_API_KEY
```

### Issue: reCAPTCHA Fails

**Symptoms:**
- "reCAPTCHA verification failed"
- Console shows reCAPTCHA errors

**Solutions:**

1. Verify site key in frontend matches Google console
2. Check domain is authorized in reCAPTCHA settings
3. Ensure secret key is set correctly
4. Test with score threshold adjustment

**Temporary bypass for testing:**
```typescript
// In functions/api/schools/submit.ts
// Comment out reCAPTCHA check temporarily
const recaptchaValid = true;  // TESTING ONLY - REMOVE IN PRODUCTION
```

### Issue: "Rate limit exceeded"

**Symptoms:**
- Error after multiple submissions

**Solutions:**

```bash
# Reset rate limit for an IP
wrangler d1 execute trade-schools-db --command="
  DELETE FROM submission_audit_log 
  WHERE ip_address='YOUR_IP_HERE' 
  AND created_at > datetime('now', '-24 hours')
"
```

### Issue: Deployment Fails

**Symptoms:**
- `wrangler pages deploy` fails

**Solutions:**

1. Check wrangler version: `wrangler --version`
2. Update wrangler: `npm install -g wrangler@latest`
3. Verify you're authenticated: `wrangler whoami`
4. Check project name is available

```bash
# List your projects
wrangler pages project list

# Try different project name
wrangler pages deploy src/ --project-name=trade-schools-v2
```

## Advanced Configuration

### Custom Domain Setup

1. In Cloudflare dashboard, go to Pages > Your Project
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `schools.yourdomain.com`)
5. Follow DNS configuration instructions
6. Update reCAPTCHA allowed domains

### Environment Variables

Set additional environment variables:
```bash
wrangler pages secret put ADMIN_EMAIL
wrangler pages secret put GEOCODING_API_KEY
```

Access in functions:
```typescript
const adminEmail = env.ADMIN_EMAIL;
```

### Analytics Integration

Add Google Analytics to `src/map.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Database Backups

```bash
# Export database to SQL
wrangler d1 export trade-schools-db --output=backup.sql

# Import backup
wrangler d1 execute trade-schools-db --file=backup.sql
```

## Next Steps

1. ✅ Complete setup following this guide
2. 📖 Review [FEATURES.md](FEATURES.md) for feature details
3. 🚀 Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
4. 📊 Explore data processing scripts in `scripts/`
5. 🎨 Customize styling and branding
6. 📈 Set up monitoring and analytics

## Support

**Common Issues:** Check troubleshooting section above

**Deployment Logs:**
```bash
wrangler pages deployment tail --project-name=trade-schools
```

**Database Queries:**
```bash
wrangler d1 execute trade-schools-db --command="YOUR_SQL_HERE"
```

**Community:**
- GitHub Issues
- Email: tom@bomforge.com

---

**Last Updated:** January 2025

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)




