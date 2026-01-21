#!/bin/bash
# Automated Heroku Environment Variables Setup

echo "🚀 Setting up Heroku environment variables..."
echo ""

# Check if logged in to Heroku
if ! heroku auth:whoami &>/dev/null; then
    echo "⚠️  Not logged in to Heroku. Logging in..."
    heroku login
fi

# Set all environment variables
echo "📝 Setting STRIPE_SECRET_KEY..."
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE -a verishelf

echo "📝 Setting SUPABASE_URL..."
heroku config:set SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co -a verishelf

echo "📝 Setting SUPABASE_ANON_KEY..."
heroku config:set SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS -a verishelf

echo ""
echo "✅ All environment variables set!"
echo ""
echo "🔍 Verifying configuration..."
heroku config -a verishelf | grep -E "STRIPE_SECRET_KEY|SUPABASE_URL|SUPABASE_ANON_KEY"

echo ""
echo "🧪 Testing the API..."
sleep 3
curl -s https://verishelf.herokuapp.com/api/health || echo "⚠️  API not responding yet, wait a few seconds and try again"

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  Don't forget to set STRIPE_WEBHOOK_SECRET after setting up the webhook in Stripe Dashboard"

