# VeriShelf.com Deployment Guide

## Domain Setup

- **Frontend**: `https://www.verishelf.com` (DreamHost)
- **Backend API**: `https://api.verishelf.com` (or external service)

## Deployment Options

### Option 1: Use Subdomain for API (Recommended if DreamHost supports Node.js)

If DreamHost supports Node.js hosting, you can set up `api.verishelf.com`:

1. **Create subdomain in DreamHost:**
   - Go to DreamHost panel
   - Domains → DNS → Add subdomain
   - Create `api.verishelf.com`
   - Point it to a Node.js hosting location (if DreamHost supports it)

2. **Upload server files:**
   - Upload `server.js` and `package.json`
   - Install dependencies: `npm install`
   - Set environment variables in DreamHost panel

3. **Update configuration:**
   - ✅ Already set: `API_BASE_URL` in `website/main.js` → `https://api.verishelf.com/api`
   - ✅ Already set: CORS in `server.js` allows `verishelf.com`

4. **Stripe webhook URL:**
   - `https://api.verishelf.com/api/webhook`

### Option 2: External Backend Service (Easier - Recommended)

Deploy backend to Railway, Render, or Heroku, then point a subdomain to it:

1. **Deploy backend:**
   - Railway: https://railway.app (easiest)
   - Render: https://render.com
   - Heroku: https://heroku.com

2. **Get your backend URL:**
   - Example: `https://verishelf-api.railway.app`

3. **Update configuration:**
   - In `website/main.js`, change line 9:
     ```javascript
     : 'https://verishelf-api.railway.app/api';
     ```

4. **Point subdomain (optional):**
   - In DreamHost DNS, create CNAME record:
     - Name: `api`
     - Value: `verishelf-api.railway.app` (or your service URL)
   - This makes `api.verishelf.com` point to your backend

5. **Stripe webhook URL:**
   - Use your backend service URL: `https://verishelf-api.railway.app/api/webhook`
   - OR if you set up subdomain: `https://api.verishelf.com/api/webhook`

## Step-by-Step: Deploy to Railway (Easiest)

### 1. Deploy Backend

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your VeriShelf repository
5. Railway will auto-detect `server.js`

### 2. Set Environment Variables

In Railway dashboard, go to your project → Variables tab, add:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

**Important:** Use **live** Stripe keys for production!

### 3. Get Your Backend URL

Railway will give you a URL like: `https://verishelf-production.up.railway.app`

### 4. Update Frontend Configuration

Update `website/main.js` line 9:

```javascript
: 'https://verishelf-production.up.railway.app/api';
```

### 5. Update Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://verishelf-production.up.railway.app/api/webhook`
4. Copy the signing secret
5. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### 6. Deploy Frontend to DreamHost

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Upload to DreamHost via FTP/SFTP:**
   - `website/index.html` → `/public_html/index.html`
   - `website/main.js` → `/public_html/main.js`
   - `website/style.css` → `/public_html/style.css`
   - `dist/` folder contents → `/public_html/dashboard/`

3. **File structure on DreamHost:**
   ```
   public_html/
   ├── index.html          (landing page)
   ├── main.js             (landing page JS)
   ├── style.css           (landing page CSS)
   └── dashboard/
       ├── index.html      (React dashboard)
       └── assets/         (React assets)
   ```

## Switch to Live Stripe Keys

### Frontend (`website/main.js`):
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SkhdB8bUD7YcCS8A420PTsRBsaXAWTPkGTpBgcE2k9VpfBqp4Ezts85jBFrcZb5G32uGXAU4vl38J6EqeaiGeYa00f4hOxTiR';
```

### Backend (Railway environment variables):
```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
```

## Testing Checklist

- [ ] Backend deployed and running
- [ ] Environment variables set on backend
- [ ] Frontend `API_BASE_URL` updated with backend URL
- [ ] Live Stripe keys set (frontend and backend)
- [ ] Stripe webhook URL updated: `https://YOUR_BACKEND_URL/api/webhook`
- [ ] Webhook secret added to backend environment variables
- [ ] Frontend files uploaded to DreamHost
- [ ] Test: `https://www.verishelf.com` loads
- [ ] Test: `https://www.verishelf.com/dashboard/` loads
- [ ] Test: Payment flow works
- [ ] Test: Webhook received in backend logs

## Current Configuration

✅ **Frontend API URL**: Set to `https://api.verishelf.com/api` (update if using external service)  
✅ **CORS**: Configured to allow `verishelf.com`  
✅ **Webhook endpoint**: Needs to be `https://YOUR_BACKEND_URL/api/webhook`

## Quick Reference

**Your Domain:** `verishelf.com`  
**Frontend:** `https://www.verishelf.com` (DreamHost)  
**Backend:** `https://api.verishelf.com` OR external service URL  
**Webhook:** `https://YOUR_BACKEND_URL/api/webhook`

