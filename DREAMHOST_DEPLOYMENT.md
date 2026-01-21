# DreamHost Deployment Guide

## Overview

You'll be deploying:
1. **Frontend** (static files) → DreamHost
2. **Backend** (Express server) → Separate Node.js hosting (Railway, Render, or DreamHost if they support Node.js)

## Step 1: Build Frontend Files

Build the production files:

```bash
npm run build
```

This creates:
- `dist/` folder with React dashboard
- `website/` folder with landing page files

## Step 2: Prepare Files for DreamHost

You need to upload:

### For Root Domain (www.verishelf.com):
- `website/index.html` → `/public_html/index.html`
- `website/main.js` → `/public_html/main.js`
- `website/style.css` → `/public_html/style.css`

### For Dashboard (www.verishelf.com/dashboard/):
- `dist/` folder contents → `/public_html/dashboard/`

## Step 3: Deploy Backend Server

The Express server (`server.js`) needs to run on a Node.js hosting service.

### Option A: DreamHost (if they support Node.js)
Check if DreamHost offers Node.js hosting. If yes:
1. Upload `server.js` and `package.json`
2. Install dependencies: `npm install`
3. Set environment variables in DreamHost panel
4. Start the server

### Option B: Railway (Recommended - Easiest)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables:
   - `STRIPE_SECRET_KEY=sk_live_...` (use live key for production)
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `SUPABASE_URL=...`
   - `SUPABASE_ANON_KEY=...`
   - `PORT=3000`
5. Deploy
6. Get your Railway URL (e.g., `https://verishelf-api.railway.app`)

### Option C: Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Build command: (leave empty)
5. Start command: `npm run server`
6. Add environment variables
7. Deploy

## Step 4: Update Frontend Configuration

Update `website/main.js` to point to your production API:

```javascript
// Change line 7 from:
const API_BASE_URL = 'http://localhost:3000/api';

// To your production server URL:
const API_BASE_URL = 'https://YOUR_SERVER_URL/api';
// Example: https://verishelf-api.railway.app/api
```

**Or** make it environment-aware:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://YOUR_SERVER_URL/api';
```

## Step 5: Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks (use live mode for production)
2. Edit your webhook endpoint
3. Update URL to: `https://YOUR_SERVER_URL/api/webhook`
   - Example: `https://verishelf-api.railway.app/api/webhook`
4. Make sure these events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your server's environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Switch to Live Stripe Keys

For production, use **live** Stripe keys:

1. **Frontend** (`website/main.js`):
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SkhdB8bUD7YcCS8A420PTsRBsaXAWTPkGTpBgcE2k9VpfBqp4Ezts85jBFrcZb5G32uGXAU4vl38J6EqeaiGeYa00f4hOxTiR';
   ```

2. **Backend** (`.env` on your server):
   ```env
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
   ```

## Step 7: Upload Files to DreamHost

### Using FTP/SFTP:

1. Connect to DreamHost via FTP/SFTP
2. Navigate to `/home/username/yourdomain.com/public_html/`
3. Upload files:
   - `website/index.html` → `index.html`
   - `website/main.js` → `main.js`
   - `website/style.css` → `style.css`
   - `dist/` folder contents → `dashboard/` folder

### File Structure on DreamHost:
```
public_html/
├── index.html          (from website/index.html)
├── main.js             (from website/main.js)
├── style.css           (from website/style.css)
└── dashboard/
    ├── index.html      (from dist/index.html)
    ├── assets/
    │   └── ...         (from dist/assets/)
    └── ...
```

## Step 8: Test Everything

1. Visit `https://www.verishelf.com` - should show landing page
2. Visit `https://www.verishelf.com/dashboard/` - should show dashboard
3. Try signing up and making a test payment
4. Check server logs for webhook events
5. Verify subscription created in Supabase

## Important Notes

- **CORS**: Make sure your backend server allows requests from `https://www.verishelf.com`
- **HTTPS**: DreamHost should provide SSL certificates automatically
- **Environment Variables**: Never commit `.env` files to Git
- **API Keys**: Use live keys for production, test keys for development

## Troubleshooting

### Dashboard not loading
- Check file paths in `dist/index.html`
- Verify `base: '/dashboard/'` in `vite.config.js` matches your deployment

### API calls failing
- Check `API_BASE_URL` in `website/main.js`
- Verify backend server is running
- Check CORS settings in `server.js`
- Check browser console for errors

### Webhooks not working
- Verify webhook URL in Stripe Dashboard includes `/api/webhook`
- Check webhook secret matches in server environment variables
- Check server logs for webhook errors

## Quick Checklist

- [ ] Frontend built (`npm run build`)
- [ ] `API_BASE_URL` updated in `website/main.js` for production
- [ ] Live Stripe keys set (frontend and backend)
- [ ] Backend server deployed (Railway/Render/etc.)
- [ ] Environment variables set on backend server
- [ ] Webhook endpoint updated in Stripe: `https://YOUR_SERVER_URL/api/webhook`
- [ ] Files uploaded to DreamHost
- [ ] Tested landing page loads
- [ ] Tested dashboard loads
- [ ] Tested payment flow
- [ ] Verified webhooks received

