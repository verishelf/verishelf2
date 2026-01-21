# Production Deployment Guide

## Current Setup

You're using Vercel for the frontend, but the Express server (`server.js`) needs to be deployed separately.

## Webhook Endpoint Configuration

### ❌ Wrong:
```
https://www.verishelf.com
```

### ✅ Correct:
```
https://www.verishelf.com/api/webhook
```

**OR** if your server is on a subdomain:
```
https://api.verishelf.com/api/webhook
```

## Deployment Options

### Option 1: Deploy Server to Separate Service (Recommended)

Deploy `server.js` to a service that supports Node.js servers:

**Railway** (Easiest):
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables from `.env`
5. Deploy
6. Get your Railway URL (e.g., `https://verishelf-api.railway.app`)
7. Update webhook endpoint in Stripe: `https://verishelf-api.railway.app/api/webhook`

**Render**:
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Build command: (leave empty, or `npm install`)
5. Start command: `npm run server`
6. Add environment variables
7. Deploy
8. Get your Render URL (e.g., `https://verishelf-api.onrender.com`)
9. Update webhook endpoint: `https://verishelf-api.onrender.com/api/webhook`

**Heroku**:
1. Install Heroku CLI
2. `heroku create verishelf-api`
3. `git push heroku main`
4. `heroku config:set STRIPE_SECRET_KEY=...` (add all env vars)
5. Get URL: `https://verishelf-api.herokuapp.com`
6. Update webhook: `https://verishelf-api.herokuapp.com/api/webhook`

### Option 2: Convert to Vercel Serverless Functions

Convert `server.js` to Vercel serverless functions. This is more complex but keeps everything on Vercel.

## Steps to Complete

### 1. Deploy Your Server

Choose one of the services above and deploy `server.js`.

### 2. Update Stripe Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks (or test mode: https://dashboard.stripe.com/test/webhooks)
2. Edit your webhook endpoint
3. Update the URL to: `https://YOUR_SERVER_URL/api/webhook`
   - Example: `https://verishelf-api.railway.app/api/webhook`
4. Make sure these events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Save and copy the **Signing secret** (starts with `whsec_`)
6. Add it to your server's environment variables

### 3. Update Frontend API URL

Update `website/main.js`:

```javascript
// Change this line (around line 7):
const API_BASE_URL = 'http://localhost:3000/api'; // For local dev

// To this for production:
const API_BASE_URL = 'https://YOUR_SERVER_URL/api'; // e.g., https://verishelf-api.railway.app/api
```

**Or** make it environment-aware:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://YOUR_SERVER_URL/api';
```

### 4. Environment Variables for Production Server

Make sure your production server has these environment variables:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

**Important:** Use **live** keys (`sk_live_...`) for production, not test keys!

### 5. Test the Webhook

1. Make a test payment on your production site
2. Check your server logs for webhook events
3. Verify the subscription is created in Supabase

## Quick Checklist

- [ ] Server deployed to Railway/Render/Heroku
- [ ] Environment variables set on production server
- [ ] Webhook endpoint updated in Stripe Dashboard: `https://YOUR_SERVER_URL/api/webhook`
- [ ] Webhook signing secret added to server environment variables
- [ ] Frontend `API_BASE_URL` updated in `website/main.js`
- [ ] Using **live** Stripe keys for production
- [ ] Test payment completed successfully
- [ ] Webhook events received in server logs

## Testing Locally First

Before deploying to production:

1. Use **test** Stripe keys
2. Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`
3. Test the full payment flow
4. Verify webhooks are received
5. Check Supabase for subscription records

## Current Status

✅ You've added the webhook secret to `.env`  
⚠️ You need to deploy the server separately  
⚠️ Update webhook URL in Stripe to include `/api/webhook` path  
⚠️ Update `API_BASE_URL` in `website/main.js` for production

