# Fix Heroku Application Error

## The Problem

The server is crashing because required environment variables are not set in Heroku.

## Quick Fix: Set Environment Variables

### Option 1: Via Heroku Dashboard (Easiest)

1. Go to: https://dashboard.heroku.com/apps/verishelf/settings
2. Click **"Reveal Config Vars"**
3. Add these variables one by one:

```
STRIPE_SECRET_KEY = sk_live_YOUR_LIVE_SECRET_KEY_HERE
```

```
SUPABASE_URL = https://bblwhwobkthawkbyhiwb.supabase.co
```

```
SUPABASE_ANON_KEY = sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
```

```
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET_HERE
```
*(Get this from Stripe Dashboard after setting up webhook)*

4. Click **"Save"** after adding each variable
5. The app will automatically restart

### Option 2: Via Heroku CLI (After Login)

```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE -a verishelf

heroku config:set SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co -a verishelf

heroku config:set SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS -a verishelf

heroku config:set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET -a verishelf
```

## Verify It's Working

After setting the variables:

1. **Check the app**: Visit `https://verishelf.herokuapp.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check logs** (if you can login to Heroku CLI):
   ```bash
   heroku logs --tail -a verishelf
   ```
   - Should see: `✅ Stripe Secret Key loaded: sk_live_...`
   - Should see: `🚀 VeriShelf Payment Server running on port...`

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | ✅ **YES** | Your Stripe secret key (live or test) |
| `SUPABASE_URL` | ✅ **YES** | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ **YES** | Your Supabase anonymous key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Recommended | Webhook signing secret from Stripe |
| `PORT` | ❌ No | Heroku sets this automatically |

## Common Issues

### "Application Error" after setting variables
- Wait 30 seconds for the app to restart
- Check logs: `heroku logs --tail -a verishelf`
- Verify all variables are set correctly (no extra spaces, no quotes)

### "Invalid API Key" error
- Make sure you're using the correct key (live vs test)
- Check for extra spaces or quotes in the config var value
- The key should start with `sk_live_` or `sk_test_`

### Server still not starting
- Check logs for specific error messages
- Verify `STRIPE_SECRET_KEY` is set (this is the most critical one)
- Make sure there are no typos in variable names

## Next Steps After Fixing

1. ✅ Set all environment variables
2. ✅ Test: `https://verishelf.herokuapp.com/api/health`
3. ✅ Set up Stripe webhook: `https://api.verishelf.com/api/webhook` (after DNS is configured)
4. ✅ Test payment flow end-to-end

