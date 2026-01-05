# Complete Deployment Guide for verishelf.com

## 📁 Project Structure

Your deployment will have this structure on DreamHost:

```
/home/username/verishelf.com/
├── index.html              # Landing page (marketing site)
├── main.js                 # Landing page JavaScript
├── style.css               # Landing page styles
├── app/                    # React Dashboard Application
│   ├── index.html          # React app entry point
│   └── assets/             # React app assets (JS, CSS)
├── server/                 # Backend API Server
│   ├── server.js           # Express server
│   ├── package.json
│   ├── .env                # Environment variables
│   └── node_modules/
└── .htaccess               # Apache configuration
```

## 🚀 Step-by-Step Deployment

### Step 1: Build the React Application

```bash
cd /Users/apple/Desktop/VeriShelf
npm run build
```

This creates the production build in the `dist/` folder.

### Step 2: Prepare Files for Upload

Create the deployment structure locally:

```bash
# Create deployment folder
mkdir ~/verishelf_deployment
cd ~/verishelf_deployment

# Copy landing page files
cp -r /Users/apple/Desktop/VeriShelf/deploy_to_dreamhost/website/* .

# Copy React app
mkdir app
cp -r /Users/apple/Desktop/VeriShelf/dist/* app/

# Copy backend server
cp -r /Users/apple/Desktop/VeriShelf/deploy_to_dreamhost/server .
```

### Step 3: Create .htaccess for URL Routing

Create `.htaccess` in the root directory:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Routes - Proxy to Node.js server
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Serve React app from /app directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/app
RewriteRule ^app/(.*)$ /app/index.html [L]

# Don't rewrite if file exists
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Default: serve landing page
RewriteRule ^$ index.html [L]
```

### Step 4: Upload to DreamHost

**Option A: Using SFTP/FTP Client (FileZilla, Cyberduck, etc.)**

1. Connect to your DreamHost server via SFTP
2. Navigate to `/home/username/verishelf.com/` (or your domain directory)
3. Upload all files maintaining the structure:
   - Upload `index.html`, `main.js`, `style.css` to root
   - Upload `app/` folder contents to `/app/`
   - Upload `server/` folder to `/server/`
   - Upload `.htaccess` to root

**Option B: Using Command Line (SSH)**

```bash
# On your local machine
cd ~/verishelf_deployment

# Upload files (replace username and domain)
scp -r * username@verishelf.com:/home/username/verishelf.com/
scp -r server/* username@verishelf.com:/home/username/verishelf.com/server/
```

### Step 5: Set Up Node.js App in DreamHost Panel

1. Log into DreamHost Panel
2. Go to **Domains** → **Manage Domains**
3. Click **Edit** next to verishelf.com
4. Scroll to **Web Options**
5. Enable **Passenger (Ruby/Node.js/Python apps)**
6. Set **Web directory** to: `/home/username/verishelf.com`
7. Set **App directory** to: `/home/username/verishelf.com/server`
8. Set **App type** to: `nodejs`
9. Set **App startup file** to: `server.js`
10. Click **Change Settings**

### Step 6: Configure Environment Variables

**Option A: Using .env file (already created)**

The `.env` file should already be in `/server/.env` with:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
PORT=3000
NODE_ENV=production
```

**Option B: Using DreamHost Environment Variables**

In DreamHost Panel → **Domains** → **Manage Domains** → **Edit** → **Environment Variables**:
- Add each variable from `.env`

### Step 7: Install Node.js Dependencies

SSH into your server:

```bash
ssh username@verishelf.com
cd ~/verishelf.com/server
npm install --production
```

### Step 8: Set File Permissions

```bash
# Make sure files are readable
chmod 644 ~/verishelf.com/index.html
chmod 644 ~/verishelf.com/.htaccess
chmod -R 755 ~/verishelf.com/app
chmod -R 755 ~/verishelf.com/server
```

### Step 9: Enable SSL/HTTPS

1. In DreamHost Panel → **Domains** → **Manage Domains**
2. Click **Edit** next to verishelf.com
3. Go to **Hosting** tab
4. Enable **Force HTTPS** (redirect HTTP to HTTPS)
5. Wait for SSL certificate to provision (usually automatic)

### Step 10: Test the Deployment

1. **Test Landing Page**: https://www.verishelf.com
2. **Test API**: https://www.verishelf.com/api/health
3. **Test Dashboard**: https://www.verishelf.com/app/
4. **Test Payment Flow**: Complete a test signup and payment

## 🔧 Configuration Updates Needed

### Update React App Base Path

If your React app uses relative paths, you may need to update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/app/',  // Add this for subdirectory deployment
})
```

Then rebuild:
```bash
npm run build
```

### Update API URLs

The website already uses `https://www.verishelf.com/api` - this is correct!

## 📋 File Checklist

Before uploading, ensure you have:

- [x] `index.html` (landing page) in root
- [x] `main.js` (landing page JS) in root
- [x] `style.css` (landing page CSS) in root
- [x] `.htaccess` in root
- [x] `app/index.html` (React app)
- [x] `app/assets/` (React app assets)
- [x] `server/server.js`
- [x] `server/package.json`
- [x] `server/.env`
- [x] `server/node_modules/` (or install on server)

## 🐛 Troubleshooting

### Landing page shows but React app doesn't load

- Check that `app/` folder exists and has `index.html`
- Verify `.htaccess` rewrite rules
- Check browser console for 404 errors
- Ensure asset paths in `app/index.html` are correct

### API calls fail

- Verify Node.js app is running (check Passenger logs)
- Check `.env` file exists and has correct keys
- Verify CORS settings in `server.js`
- Test API directly: `curl https://www.verishelf.com/api/health`

### Payment form doesn't work

- Verify Stripe keys are correct
- Check browser console for errors
- Ensure HTTPS is enabled (Stripe requires it)
- Verify API URL is `https://www.verishelf.com/api`

### Check Passenger Logs

```bash
# SSH into server
tail -f ~/logs/verishelf.com/error.log
```

## ✅ Post-Deployment Checklist

- [ ] Landing page loads at https://www.verishelf.com
- [ ] React dashboard loads at https://www.verishelf.com/app/
- [ ] API health check works: https://www.verishelf.com/api/health
- [ ] Payment form displays correctly
- [ ] Test payment with Stripe test card works
- [ ] Redirect after signup goes to `/app/`
- [ ] HTTPS is enabled and working
- [ ] SSL certificate is valid

## 🔄 Updating the Site

### Update Landing Page

1. Edit files in `deploy_to_dreamhost/website/`
2. Upload to root of verishelf.com

### Update React App

1. Make changes in `/src`
2. Run `npm run build`
3. Upload `dist/*` to `/app/` on server

### Update Backend

1. Edit `server/server.js`
2. Upload to `/server/` on server
3. Restart Passenger app (or it auto-restarts)

## 📞 Support

- DreamHost Support: https://help.dreamhost.com
- Passenger Logs: `~/logs/verishelf.com/error.log`
- Stripe Dashboard: https://dashboard.stripe.com

