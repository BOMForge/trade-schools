# Deployment Guide

Complete guide for deploying the Trade Schools Directory platform to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Methods](#deployment-methods)
3. [Production Configuration](#production-configuration)
4. [Post-Deployment](#post-deployment)
5. [Monitoring](#monitoring)
6. [Rollback Procedures](#rollback-procedures)

## Pre-Deployment Checklist

Before deploying, ensure:

### ✅ Configuration Complete
- [ ] Database created and schema executed
- [ ] Environment variables set (RESEND_API_KEY, RECAPTCHA_SECRET_KEY)
- [ ] reCAPTCHA keys updated in frontend files
- [ ] Email addresses configured in API functions
- [ ] D1 database binding configured

### ✅ Testing Passed
- [ ] Local testing successful
- [ ] Form submissions work
- [ ] Emails sending correctly
- [ ] Database storing data
- [ ] All visualizations working

### ✅ Data Ready
- [ ] CSV files in `data/production/` directory
- [ ] Files committed to repository
- [ ] Data validated and geocoded

### ✅ Security
- [ ] reCAPTCHA enabled
- [ ] Rate limiting configured
- [ ] No sensitive data in code
- [ ] API keys stored as secrets

## Deployment Methods

### Method 1: Wrangler CLI (Recommended)

#### Initial Deployment

```bash
# Navigate to project root
cd /Users/tc/workspace/TradeSchools

# Deploy to Cloudflare Pages
wrangler pages deploy src/ --project-name=trade-schools

# Note the deployment URL in output
```

#### Subsequent Deployments

```bash
# Deploy updates
wrangler pages deploy src/ --project-name=trade-schools

# Deploy with environment
wrangler pages deploy src/ --project-name=trade-schools --env=production
```

### Method 2: Git Integration (Automatic)

#### One-Time Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Click **Connect to Git**
5. Select your repository
6. Configure build settings:
   - **Project name:** `trade-schools`
   - **Production branch:** `main`
   - **Build command:** (leave empty)
   - **Build output directory:** `src`
7. Click **Save and Deploy**

#### Automatic Deployments

```bash
# Any push to main triggers deployment
git add .
git commit -m "Update feature"
git push origin main

# Preview deployments for branches
git checkout -b feature-branch
git push origin feature-branch
# Creates preview at: feature-branch.trade-schools.pages.dev
```

### Method 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: trade-schools
          directory: src
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Production Configuration

### Environment Variables

Set in Cloudflare Pages Dashboard or via CLI:

```bash
# Required Secrets
wrangler pages secret put RESEND_API_KEY --project-name=trade-schools
wrangler pages secret put RECAPTCHA_SECRET_KEY --project-name=trade-schools

# Optional Configuration
wrangler pages secret put ADMIN_EMAIL --project-name=trade-schools
wrangler pages secret put GEOCODING_API_KEY --project-name=trade-schools
```

### Database Binding

**Via Dashboard:**
1. Pages > trade-schools > Settings > Functions
2. D1 database bindings
3. Add binding:
   - Variable name: `DB`
   - D1 database: `trade-schools-db`

**Via wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "trade-schools-db"
database_id = "your-database-id"
```

### Custom Domain Setup

1. **In Cloudflare Dashboard:**
   - Pages > trade-schools > Custom domains
   - Click "Set up a custom domain"
   - Enter domain (e.g., `schools.bomforge.com`)

2. **Update DNS:**
   - Add CNAME record: `schools` → `trade-schools.pages.dev`
   - Or use Cloudflare DNS (automatic)

3. **Update reCAPTCHA:**
   - Go to Google reCAPTCHA console
   - Add custom domain to authorized domains

4. **Update Frontend:**
   - Update any hardcoded URLs to use custom domain

### Performance Optimization

#### Enable Caching

Add headers in `functions/_headers`:
```
/data/*
  Cache-Control: public, max-age=3600

/*.html
  Cache-Control: public, max-age=600

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

#### Compress Assets

```bash
# Install dependencies
npm install --save-dev csso-cli html-minifier terser

# Add to package.json scripts
{
  "scripts": {
    "build": "npm run minify:css && npm run minify:html && npm run minify:js",
    "minify:css": "csso src/assets/css/*.css -o dist/",
    "minify:html": "html-minifier --collapse-whitespace --remove-comments src/*.html",
    "minify:js": "terser src/assets/js/*.js -o dist/"
  }
}
```

#### Enable Cloudflare Features

In Cloudflare Dashboard:
- **Auto Minify:** Enable for HTML, CSS, JS
- **Brotli Compression:** Enable
- **HTTP/3 (QUIC):** Enable
- **Early Hints:** Enable

## Post-Deployment

### Verify Deployment

1. **Check Deployment Status**
```bash
wrangler pages deployment list --project-name=trade-schools
```

2. **Test Production URL**
```bash
# Open in browser
open https://trade-schools.pages.dev

# Or use curl
curl -I https://trade-schools.pages.dev
```

3. **Verify Features:**
   - [ ] Landing page loads
   - [ ] Interactive map displays
   - [ ] CSV data loads
   - [ ] School markers appear
   - [ ] Filters work
   - [ ] Forms submit successfully
   - [ ] Emails send

### Initial Data Population

If deploying fresh instance:

```bash
# Check current school count
wrangler d1 execute trade-schools-db --command="
  SELECT COUNT(*) as count FROM approved_schools
"

# If empty, populate from CSV (manual process)
# Use admin dashboard or bulk import script
```

### Test Form Submissions

1. Submit test school through form
2. Verify email received
3. Check database:
```bash
wrangler d1 execute trade-schools-db --command="
  SELECT * FROM pending_schools ORDER BY submitted_at DESC LIMIT 1
"
```

### DNS Propagation

If using custom domain:
```bash
# Check DNS propagation
dig schools.bomforge.com

# Check SSL certificate
curl -vI https://schools.bomforge.com 2>&1 | grep -i ssl
```

## Monitoring

### Real-Time Logs

```bash
# Tail deployment logs
wrangler pages deployment tail --project-name=trade-schools

# Filter for errors
wrangler pages deployment tail --project-name=trade-schools | grep ERROR
```

### Analytics Dashboard

Access in Cloudflare Dashboard:
- Pages > trade-schools > Analytics
- View requests, bandwidth, errors

### Database Monitoring

```bash
# Daily submission count
wrangler d1 execute trade-schools-db --command="
  SELECT DATE(submitted_at) as date, COUNT(*) as count
  FROM pending_schools
  GROUP BY DATE(submitted_at)
  ORDER BY date DESC
  LIMIT 7
"

# Error rate
wrangler d1 execute trade-schools-db --command="
  SELECT 
    COUNT(CASE WHEN status='error' THEN 1 END) as errors,
    COUNT(*) as total,
    ROUND(COUNT(CASE WHEN status='error' THEN 1 END) * 100.0 / COUNT(*), 2) as error_rate
  FROM submission_audit_log
  WHERE created_at > datetime('now', '-24 hours')
"
```

### Uptime Monitoring

Set up external monitoring:

**Using UptimeRobot (Free):**
1. Go to https://uptimerobot.com
2. Add new monitor
3. Type: HTTP(s)
4. URL: https://trade-schools.pages.dev
5. Alert contacts: Your email

**Using Cloudflare Workers:**
Create `monitor.js`:
```javascript
addEventListener('scheduled', event => {
  event.waitUntil(checkSite());
});

async function checkSite() {
  const response = await fetch('https://trade-schools.pages.dev');
  if (response.status !== 200) {
    await sendAlert(`Site down: ${response.status}`);
  }
}
```

### Email Delivery Monitoring

Check Resend dashboard:
- Deliverability rate
- Bounce rate
- Failed sends

Set up webhooks for email events:
```bash
# In Resend dashboard
Webhooks > Add webhook
URL: https://trade-schools.pages.dev/api/email-webhook
Events: email.delivered, email.bounced, email.complained
```

## Rollback Procedures

### Rollback to Previous Deployment

```bash
# List recent deployments
wrangler pages deployment list --project-name=trade-schools

# Get deployment ID of working version
# Promote that deployment to production
wrangler pages deployment promote DEPLOYMENT_ID --project-name=trade-schools
```

### Rollback via Git

```bash
# Find last working commit
git log --oneline

# Revert to specific commit
git revert COMMIT_HASH

# Or reset (careful!)
git reset --hard COMMIT_HASH
git push origin main --force  # Only if necessary
```

### Database Rollback

```bash
# Export current state first
wrangler d1 export trade-schools-db --output=backup-before-rollback.sql

# Restore from backup
wrangler d1 execute trade-schools-db --file=backup-previous.sql
```

### Emergency Maintenance Mode

Create `src/_redirects`:
```
/*  /maintenance.html  200
```

Deploy:
```bash
wrangler pages deploy src/ --project-name=trade-schools
```

## Deployment Environments

### Production
- Branch: `main`
- URL: `https://trade-schools.pages.dev`
- Custom domain: `https://schools.bomforge.com`

### Staging
- Branch: `staging`
- URL: `https://staging.trade-schools.pages.dev`

```bash
# Deploy to staging
git push origin staging

# Or deploy specific branch
wrangler pages deploy src/ --project-name=trade-schools --branch=staging
```

### Development
- Branch: feature branches
- URL: `https://[branch-name].trade-schools.pages.dev`

## Performance Benchmarks

Target metrics:
- **Page Load:** < 2s
- **Time to Interactive:** < 3s
- **API Response:** < 500ms
- **Database Query:** < 100ms

Test with:
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://trade-schools.pages.dev

# WebPageTest
# Visit https://www.webpagetest.org/
```

## Security Checklist

Post-deployment security:
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] reCAPTCHA working
- [ ] Rate limiting active
- [ ] SQL injection protection (using Zod validation)
- [ ] XSS protection (CSP headers)
- [ ] Secrets not exposed in code
- [ ] Admin dashboard protected

Add CSP headers in `functions/_headers`:
```
/*.html
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://www.google.com; style-src 'self' 'unsafe-inline' https://unpkg.com;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## Troubleshooting Deployment Issues

### "Failed to publish"

```bash
# Check authentication
wrangler whoami

# Re-authenticate
wrangler logout
wrangler login
```

### "Database binding not found"

1. Verify binding in dashboard: Pages > Settings > Functions
2. Check `wrangler.toml` configuration
3. Redeploy after adding binding

### "Too many files"

```bash
# Create .cfignore file
echo "archive/" > .cfignore
echo "data/raw/" >> .cfignore
echo "scripts/" >> .cfignore
echo ".git/" >> .cfignore
```

### "Build failed"

Check for:
- Syntax errors in TypeScript functions
- Missing dependencies
- Invalid `wrangler.toml`

```bash
# Validate wrangler.toml
wrangler pages validate

# Check function syntax
npx tsc --noEmit
```

## Maintenance Windows

For zero-downtime deployments:
1. Cloudflare Pages handles blue-green deployment automatically
2. Old version serves traffic until new version ready
3. Instant rollback available

For database migrations:
1. Create migration script
2. Test in staging
3. Apply during low-traffic period
4. Monitor for errors

```bash
# Database migration example
wrangler d1 execute trade-schools-db --file=migrations/001_add_field.sql
```

## Cost Monitoring

Monitor Cloudflare costs:
- Pages: Free for most usage
- D1: Free tier includes 5GB storage, 5M reads/day
- Workers: Free tier includes 100k requests/day

Check usage:
```bash
# D1 usage
wrangler d1 info trade-schools-db

# Pages usage (in dashboard)
# Pages > Usage
```

---

**Deployment Checklist Summary:**
1. ✅ Complete setup and testing
2. ✅ Set environment variables
3. ✅ Deploy via wrangler or Git
4. ✅ Configure D1 binding
5. ✅ Set up custom domain (optional)
6. ✅ Verify deployment
7. ✅ Enable monitoring
8. ✅ Test all features in production

**Current Deployment:**
- URL: https://trade-schools.pages.dev
- Status: Check via dashboard or wrangler

For setup instructions, see [SETUP.md](SETUP.md)

---

**Last Updated:** January 2025




