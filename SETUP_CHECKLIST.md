# School Submission System - Setup Checklist

Use this checklist to ensure you've completed all steps for deploying the new school submission system.

## ☑️ Pre-Deployment Checklist

### 1. Accounts & Services Setup

- [ ] **Cloudflare Account** - Sign up at [cloudflare.com](https://www.cloudflare.com/)
- [ ] **Google reCAPTCHA** - Create site at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
  - Type: reCAPTCHA v3
  - Domain: Your deployment domain
  - Save Site Key and Secret Key
- [ ] **Email Service** (choose one):
  - [ ] Resend.com account created
  - [ ] SendGrid account created
  - [ ] Mailgun account created
  - [ ] Cloudflare Email Workers configured
  - Save API Key

### 2. Database Setup

- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Login to Wrangler: `wrangler login`
- [ ] Create D1 database: `wrangler d1 create trade-schools-db`
- [ ] Save database ID from output
- [ ] Run schema: `wrangler d1 execute trade-schools-db --file=schema.sql`
- [ ] Verify tables: `wrangler d1 execute trade-schools-db --command="SELECT name FROM sqlite_master WHERE type='table'"`
- [ ] Expected tables: `pending_schools`, `approved_schools`, `submission_audit_log`, `admin_users`

### 3. Configuration Files

#### wrangler.toml
- [ ] Create `wrangler.toml` in project root
- [ ] Add database binding with correct database_id
- [ ] Set project name

#### clean-map.html
- [ ] Add `<script src="form-submission.js"></script>` before `</body>`
- [ ] Update reCAPTCHA script with your Site Key (line 13):
  ```html
  <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
  ```

#### form-submission.js
- [ ] Update line 7 with your reCAPTCHA Site Key:
  ```javascript
  const RECAPTCHA_SITE_KEY = 'YOUR_SITE_KEY_HERE';
  ```

#### functions/api/schools/submit.ts
- [ ] Update email configuration (lines 217-227):
  - Set correct "from" email domain
  - Set correct "to" email (default: tom@bomforge.com)
- [ ] Choose email service (Resend/SendGrid/Mailgun)

### 4. Environment Variables

- [ ] Set reCAPTCHA Secret Key:
  ```bash
  wrangler pages secret put RECAPTCHA_SECRET_KEY
  ```
- [ ] Set Email API Key:
  ```bash
  wrangler pages secret put RESEND_API_KEY
  # Or SENDGRID_API_KEY, MAILGUN_API_KEY, etc.
  ```

### 5. Testing

- [ ] Start local dev server: `wrangler pages dev --d1 DB=trade-schools-db --port 8080`
- [ ] Open browser: http://localhost:8080
- [ ] Test form submission with valid data
- [ ] Verify success message appears
- [ ] Check database: `wrangler d1 execute trade-schools-db --command="SELECT * FROM pending_schools"`
- [ ] Verify email received
- [ ] Test validation errors (empty required fields)
- [ ] Test phone formatting
- [ ] Test ZIP code formatting
- [ ] Test program selection (at least one required)
- [ ] Test "Other" program field

### 6. Deployment

- [ ] Deploy to Cloudflare Pages:
  ```bash
  wrangler pages deploy . --project-name=trade-schools
  ```
- [ ] Or push to Git (if using Git integration):
  ```bash
  git add .
  git commit -m "Deploy school submission system"
  git push origin main
  ```
- [ ] Verify deployment succeeded
- [ ] Visit live URL
- [ ] Submit test school
- [ ] Verify in production database

### 7. Post-Deployment

- [ ] Test live form submission
- [ ] Verify email notifications work
- [ ] Check admin dashboard: `your-domain.com/admin-dashboard.html`
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Document admin procedures
- [ ] Train team on admin dashboard

---

## 🚨 Common Issues Checklist

If something doesn't work, check:

### Form Not Submitting
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows POST to `/api/schools/submit`
- [ ] reCAPTCHA Site Key is correct
- [ ] No CORS errors

### Database Errors
- [ ] D1 binding configured in `wrangler.toml`
- [ ] Database ID is correct
- [ ] Schema was applied successfully
- [ ] Tables exist

### Emails Not Sending
- [ ] Email API key is set correctly
- [ ] Sending domain is verified (for Resend/SendGrid)
- [ ] Check email service dashboard for errors
- [ ] "From" email matches verified domain

### reCAPTCHA Fails
- [ ] Site Key matches domain
- [ ] Domain added to reCAPTCHA console
- [ ] Secret Key set in environment
- [ ] Using v3 (not v2)

---

## 📝 Field Requirements Reference

### Required Fields (Cannot be empty)
1. **School Name** - 2-100 characters
2. **Street Address** - 5-200 characters
3. **City** - 2-50 characters
4. **State** - 2-letter code from dropdown
5. **ZIP Code** - 12345 or 12345-6789 format
6. **Contact Email** - Valid email format
7. **Phone** - 10 digits, auto-formats to (XXX) XXX-XXXX
8. **Programs** - At least one must be selected

### Optional Fields
9. **Website** - Valid URL (auto-prepends https://)
10. **Program Other** - Required if "Other" program selected
11. **School Description** - Max 500 characters
12. **Submitter Name** - For follow-up contact

---

## 🔐 Security Checklist

- [ ] reCAPTCHA configured (prevents bots)
- [ ] Rate limiting active (5 per IP per 24h)
- [ ] Server-side validation enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CORS headers configured correctly
- [ ] Environment secrets not in code
- [ ] Database not publicly accessible

---

## 📊 Monitoring Setup

### Daily Checks
- [ ] Review pending submissions
- [ ] Approve/reject new schools
- [ ] Check for spam submissions

### Weekly Checks
- [ ] Review submission trends
- [ ] Check error logs: `wrangler pages deployment tail`
- [ ] Verify email delivery rate
- [ ] Monitor database size

### Monthly Checks
- [ ] Backup database
- [ ] Review and update validation rules
- [ ] Check for duplicate schools
- [ ] Analyze submission sources

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Form loads without errors
✅ All fields validate correctly
✅ Submission shows success message
✅ Data appears in database
✅ Email notification received
✅ Admin dashboard shows submission
✅ Phone/ZIP auto-format works
✅ Program selection enforced
✅ reCAPTCHA badge visible
✅ No console errors

---

## 📞 Quick Commands

```bash
# View logs
wrangler pages deployment tail --project-name=trade-schools

# Query pending submissions
wrangler d1 execute trade-schools-db --command="SELECT school_name, city, state, submitted_at FROM pending_schools WHERE status='pending' ORDER BY submitted_at DESC LIMIT 10"

# Count submissions by status
wrangler d1 execute trade-schools-db --command="SELECT status, COUNT(*) as count FROM pending_schools GROUP BY status"

# Approve a submission
wrangler d1 execute trade-schools-db --command="UPDATE pending_schools SET status='approved', reviewed_at=datetime('now'), reviewed_by='admin' WHERE id='SUBMISSION_ID'"

# Delete test submissions
wrangler d1 execute trade-schools-db --command="DELETE FROM pending_schools WHERE school_name LIKE '%test%'"
```

---

## 📚 Next Steps After Deployment

1. **Add Automated Geocoding**
   - Integrate Google Maps Geocoding API
   - Auto-convert addresses to lat/lon on approval

2. **Enhance Admin Dashboard**
   - Add authentication
   - Bulk approve/reject
   - Search and filtering
   - Export to CSV

3. **Email Improvements**
   - Send confirmation to submitter
   - Email verification before review
   - Approval/rejection notifications

4. **Analytics**
   - Track submission sources
   - Conversion rate monitoring
   - Popular programs analysis

5. **Additional Features**
   - Bulk CSV import
   - School photos upload
   - Program categories
   - Student reviews/ratings

---

*Last updated: January 2025*
