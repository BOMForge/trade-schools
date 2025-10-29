#!/bin/bash

# Trade Schools Map - Quick Setup Script
# Run this to set up your Cloudflare environment

echo "🚀 Trade Schools Map Setup"
echo "================================"
echo ""

# Step 1: Login
echo "Step 1: Logging in to Cloudflare..."
wrangler login

# Step 2: Create database
echo ""
echo "Step 2: Creating D1 database..."
wrangler d1 create trade-schools-db

echo ""
echo "⚠️  IMPORTANT: Copy the database_id from above and paste it into wrangler.toml line 7"
echo "Press Enter when you've updated wrangler.toml..."
read

# Step 3: Execute schema
echo ""
echo "Step 3: Creating database tables..."
wrangler d1 execute trade-schools-db --file=schema.sql

echo ""
echo "✅ Database created successfully!"
echo ""

# Step 4: Set secrets
echo "Step 4: Setting up secrets..."
echo ""
echo "You'll need:"
echo "  1. Resend API Key (get from https://resend.com)"
echo "  2. reCAPTCHA Secret Key (get from https://www.google.com/recaptcha/admin)"
echo ""
read -p "Do you have these ready? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Setting RESEND_API_KEY..."
    wrangler pages secret put RESEND_API_KEY
    
    echo "Setting RECAPTCHA_SECRET_KEY..."
    wrangler pages secret put RECAPTCHA_SECRET_KEY
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update reCAPTCHA site key in:"
echo "   - form-submission.js (line 6)"
echo "   - clean-map.html (line 24)"
echo ""
echo "2. Deploy to Cloudflare Pages:"
echo "   wrangler pages deploy . --project-name=trade-schools-map"
echo ""
echo "3. In Cloudflare Dashboard > Pages > Settings > Functions:"
echo "   Add D1 binding: Variable name 'DB' → database 'trade-schools-db'"
echo ""
echo "📚 See CLOUDFLARE-SETUP.md for detailed instructions"
echo "================================"


