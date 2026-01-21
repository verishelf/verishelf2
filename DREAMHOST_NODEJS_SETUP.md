# DreamHost Node.js Setup for api.verishelf.com

## Important: DreamHost Hosting Requirements

**DreamHost shared hosting does NOT support Node.js.** You need one of these:

1. **VPS (Virtual Private Server)** - Recommended
2. **Dedicated Server**
3. **OR** Deploy backend elsewhere and point subdomain to it

## Option 1: Use DreamHost VPS (If You Have It)

If you have a DreamHost VPS, you can run Node.js directly:

### Step 1: Complete the Subdomain Setup
Click "Complete Setup" in the DreamHost panel for `api.verishelf.com`

### Step 2: SSH into Your VPS
```bash
ssh your_username@api.verishelf.com
```

### Step 3: Install Node.js (if not already installed)
```bash
# Install Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest Node.js
nvm install node
nvm use node
```

### Step 4: Upload Server Files
Upload these files to your VPS:
- `server.js`
- `package.json`
- `.env` (with your environment variables)

### Step 5: Install Dependencies
```bash
cd /path/to/your/server
npm install
```

### Step 6: Set Up Environment Variables
Create `.env` file:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=8080
```

**Note:** Use port 8080 or another non-privileged port (not 80 or 443)

### Step 7: Set Up Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name verishelf-api
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### Step 8: Configure Proxy in DreamHost Panel
1. Go to DreamHost Panel → Domains → Manage Domains
2. Find `api.verishelf.com`
3. Enable "Proxy to another port"
4. Set port to `8080` (or whatever port you used)
5. Enable SSL/HTTPS

### Step 9: Update Stripe Webhook
Set webhook URL to: `https://api.verishelf.com/api/webhook`

## Option 2: Deploy Backend Elsewhere + Point Subdomain (Easier)

If you don't have a VPS, deploy the backend to Railway/Render and point the subdomain:

### Step 1: Deploy to Railway (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables (see below)
5. Get your Railway URL: `https://verishelf-api.up.railway.app`

### Step 2: Point Subdomain in DreamHost
1. Go to DreamHost Panel → Domains → DNS
2. Find `api.verishelf.com`
3. Add CNAME record:
   - Name: `api`
   - Value: `verishelf-api.up.railway.app` (your Railway URL)
   - TTL: 3600

### Step 3: Wait for DNS Propagation
Wait 5-30 minutes for DNS to update

### Step 4: Update Configuration
In `website/main.js`, the API URL is already set to `https://api.verishelf.com/api` ✅

### Step 5: Update Stripe Webhook
Set webhook URL to: `https://api.verishelf.com/api/webhook`

## Environment Variables for Railway

When deploying to Railway, add these environment variables:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

## Which Option Should You Choose?

**If you have DreamHost VPS:**
- ✅ Use Option 1 (run Node.js directly on DreamHost)
- More control, everything in one place

**If you only have shared hosting:**
- ✅ Use Option 2 (Railway + subdomain)
- Easier setup, no VPS needed
- Railway has free tier for testing

## Current Status

You've started setting up `api.verishelf.com` in DreamHost. 

**Next steps:**
1. Determine if you have VPS or shared hosting
2. If VPS → Follow Option 1
3. If shared → Follow Option 2 (deploy to Railway, then point subdomain)

## Quick Decision Guide

**Do you have SSH access and can install Node.js?**
- Yes → Option 1 (DreamHost VPS)
- No → Option 2 (Railway + CNAME)

