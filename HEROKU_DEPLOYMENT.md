# Heroku Deployment Guide for VeriShelf

## Your Heroku App
- **App Name**: `verishelf`
- **URL**: `https://verishelf.herokuapp.com`

## Step 1: Procfile Created ✅

I've created a `Procfile` that tells Heroku to run `node server.js`.

## Step 2: Set Environment Variables in Heroku

Go to your Heroku dashboard and set these environment variables:

### In Heroku Dashboard:
1. Go to https://dashboard.heroku.com/apps/verishelf
2. Click **Settings** tab
3. Click **Reveal Config Vars**
4. Add these variables:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

**Important:** 
- Use **live** Stripe keys for production (`sk_live_...`)
- Get `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard after setting up webhook (see Step 4)

### Or via Heroku CLI:
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
heroku config:set SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
heroku config:set SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
```

## Step 3: Deploy to Heroku

Since you've connected to GitHub, you can deploy in two ways:

### Option A: Automatic Deploy (Recommended)
1. In Heroku Dashboard → **Deploy** tab
2. Under "Automatic deploys", select your branch (usually `main`)
3. Click **Enable Automatic Deploys**
4. Click **Deploy Branch** to deploy now

### Option B: Manual Deploy via CLI
```bash
git add .
git commit -m "Add Procfile for Heroku deployment"
git push origin main
git push heroku main
```

## Step 4: Set Up Stripe Webhook

1. **Get your Heroku URL:**
   - Your app URL: `https://verishelf.herokuapp.com`
   - Webhook endpoint: `https://verishelf.herokuapp.com/api/webhook`

2. **In Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks (use **live** mode for production)
   - Click **Add endpoint** (or edit existing)
   - Endpoint URL: `https://verishelf.herokuapp.com/api/webhook`
   - Select these events:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to Heroku config vars as `STRIPE_WEBHOOK_SECRET`

## Step 5: Update Frontend API URL

Update `website/main.js` to use your Heroku URL:

**Option A: Use Heroku URL directly**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://verishelf.herokuapp.com/api';
```

**Option B: Use api.verishelf.com subdomain (Recommended)**
If you want to use `api.verishelf.com` instead:

1. **Point subdomain to Heroku:**
   - In DreamHost DNS, add CNAME record:
     - Name: `api`
     - Value: `verishelf.herokuapp.com`
   - Wait 5-30 minutes for DNS propagation

2. **Update Heroku to accept custom domain:**
   ```bash
   heroku domains:add api.verishelf.com
   ```

3. **Update `website/main.js`:**
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
     ? 'http://localhost:3000/api'
     : 'https://api.verishelf.com/api';
   ```

## Step 6: Switch to Live Stripe Keys

### Frontend (`website/main.js`):
Change line 5:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SkhdB8bUD7YcCS8A420PTsRBsaXAWTPkGTpBgcE2k9VpfBqp4Ezts85jBFrcZb5G32uGXAU4vl38J6EqeaiGeYa00f4hOxTiR';
```

### Backend (Heroku Config Vars):
Already set in Step 2 above ✅

## Step 7: Test the Deployment

1. **Check if server is running:**
   ```bash
   heroku logs --tail
   ```
   You should see: `🚀 VeriShelf Payment Server running on port...`

2. **Test health endpoint:**
   Visit: `https://verishelf.herokuapp.com/api/health`
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Test payment flow:**
   - Go to your website
   - Try signing up and making a payment
   - Check Heroku logs for webhook events

## Step 8: View Logs

```bash
heroku logs --tail
```

Or in Heroku Dashboard → **More** → **View logs**

## Troubleshooting

### App won't start
- Check `Procfile` exists and has: `web: node server.js`
- Check environment variables are set
- Check logs: `heroku logs --tail`

### Webhook not working
- Verify webhook URL in Stripe: `https://verishelf.herokuapp.com/api/webhook`
- Check `STRIPE_WEBHOOK_SECRET` matches in Heroku and Stripe
- Check Heroku logs for webhook errors

### CORS errors
- Server.js already configured to allow `verishelf.com` ✅
- If using `api.verishelf.com`, add it to CORS origins in `server.js`

## Quick Checklist

- [ ] Procfile created ✅
- [ ] Environment variables set in Heroku
- [ ] Code pushed to GitHub
- [ ] Heroku app deployed
- [ ] Stripe webhook URL set: `https://verishelf.herokuapp.com/api/webhook`
- [ ] Webhook secret added to Heroku config
- [ ] Frontend `API_BASE_URL` updated
- [ ] Live Stripe keys set (frontend and backend)
- [ ] Tested health endpoint
- [ ] Tested payment flow

## Your URLs

- **Backend API**: `https://verishelf.herokuapp.com`
- **Webhook Endpoint**: `https://verishelf.herokuapp.com/api/webhook`
- **Health Check**: `https://verishelf.herokuapp.com/api/health`
- **Frontend**: `https://www.verishelf.com` (DreamHost)

## Next Steps

1. Set environment variables in Heroku Dashboard
2. Deploy (automatic or manual)
3. Set up Stripe webhook with Heroku URL
4. Update `API_BASE_URL` in `website/main.js`
5. Test!

