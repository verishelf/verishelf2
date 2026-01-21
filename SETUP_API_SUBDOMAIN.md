# Setting Up api.verishelf.com with Heroku

## Step 1: Add Custom Domain to Heroku

Run this command (after logging into Heroku CLI):

```bash
heroku domains:add api.verishelf.com -a verishelf
```

This will give you a DNS target like: `verishelf-1234567890.herokudns.com`

## Step 2: Configure DNS in DreamHost

1. Go to DreamHost Panel → Domains → DNS
2. Find `verishelf.com` domain
3. Add a CNAME record:
   - **Name**: `api`
   - **Type**: `CNAME`
   - **Value**: `verishelf-1234567890.herokudns.com` (the target Heroku gave you)
   - **TTL**: `3600` (or default)

## Step 3: Wait for DNS Propagation

- Wait 5-30 minutes for DNS to update
- You can check with: `dig api.verishelf.com` or `nslookup api.verishelf.com`

## Step 4: Verify SSL Certificate

Heroku will automatically provision an SSL certificate for `api.verishelf.com`. This usually takes a few minutes after DNS propagates.

Check status:
```bash
heroku certs:auto:wait -a verishelf
```

Or check in Heroku Dashboard → Settings → Domains

## Step 5: Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks (use **live** mode for production)
2. Edit your webhook endpoint
3. Update URL to: `https://api.verishelf.com/api/webhook`
4. Save and copy the new **Signing secret** (if it changed)
5. Add it to Heroku config vars as `STRIPE_WEBHOOK_SECRET`

## Step 6: Set Environment Variables in Heroku

Make sure these are set in Heroku Dashboard → Settings → Config Vars:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
```

## Step 7: Test the API

Once DNS propagates, test:
- `https://api.verishelf.com/api/health` should return: `{"status":"ok","timestamp":"..."}`

## Current Configuration

✅ Frontend (`website/main.js`) is already set to use `https://api.verishelf.com/api`  
✅ CORS in `server.js` already allows `api.verishelf.com`  
✅ Procfile is set to run `node server.js`

## Quick Checklist

- [ ] Add custom domain to Heroku: `heroku domains:add api.verishelf.com`
- [ ] Get DNS target from Heroku
- [ ] Add CNAME record in DreamHost DNS
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify SSL certificate is active
- [ ] Update Stripe webhook URL to `https://api.verishelf.com/api/webhook`
- [ ] Set environment variables in Heroku
- [ ] Test: `https://api.verishelf.com/api/health`
- [ ] Test payment flow end-to-end

