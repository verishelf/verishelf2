#!/bin/bash
# Script to set all Heroku environment variables
# Run this after logging into Heroku: heroku login

echo "Setting Heroku environment variables..."

heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE -a verishelf

heroku config:set SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co -a verishelf

heroku config:set SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS -a verishelf

echo ""
echo "✅ Environment variables set!"
echo ""
echo "⚠️  Don't forget to set STRIPE_WEBHOOK_SECRET after setting up the webhook in Stripe Dashboard"
echo ""
echo "Test your app: https://verishelf.herokuapp.com/api/health"

