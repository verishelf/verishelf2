# DreamHost Upload Guide - Complete Instructions

## ✅ Your API is Working!

Your Heroku backend is running at:
- `https://verishelf.herokuapp.com` (or `https://api.verishelf.com` after DNS setup)
- API is responding correctly ✅

## Step 1: Build the Frontend

First, build the React dashboard:

```bash
cd /Users/apple/Desktop/VeriShelf
npm run build
```

This creates the `dist/` folder with the compiled React app.

## Step 2: Files to Upload to DreamHost

### For Root Domain (www.verishelf.com):

Upload these files from the `website/` folder:

```
website/index.html  →  /public_html/index.html
website/main.js     →  /public_html/main.js
website/style.css   →  /public_html/style.css
```

### For Dashboard (www.verishelf.com/dashboard/):

Upload the entire contents of the `dist/` folder:

```
dist/index.html           →  /public_html/dashboard/index.html
dist/assets/              →  /public_html/dashboard/assets/
(dist folder contents)    →  /public_html/dashboard/
```

## Step 3: File Structure on DreamHost

Your DreamHost `public_html/` should look like this:

```
public_html/
├── index.html          (landing page - from website/index.html)
├── main.js             (landing page JS - from website/main.js)
├── style.css           (landing page CSS - from website/style.css)
└── dashboard/
    ├── index.html      (React dashboard - from dist/index.html)
    └── assets/
        ├── index-xxxxx.js
        ├── index-xxxxx.css
        └── ...         (all files from dist/assets/)
```

## Step 4: Upload Methods

### Option A: FTP/SFTP Client (FileZilla, Cyberduck, etc.)

1. Connect to DreamHost via FTP/SFTP
2. Navigate to `/home/username/verishelf.com/public_html/`
3. Upload files as shown above

### Option B: DreamHost File Manager

1. Log into DreamHost Panel
2. Go to Files → File Manager
3. Navigate to your domain's `public_html/` folder
4. Upload files using the web interface

### Option C: Command Line (if you have SSH access)

```bash
# From your local machine
cd /Users/apple/Desktop/VeriShelf

# Upload landing page files
scp website/index.html username@verishelf.com:~/verishelf.com/public_html/
scp website/main.js username@verishelf.com:~/verishelf.com/public_html/
scp website/style.css username@verishelf.com:~/verishelf.com/public_html/

# Upload dashboard (create directory first)
ssh username@verishelf.com "mkdir -p ~/verishelf.com/public_html/dashboard"
scp -r dist/* username@verishelf.com:~/verishelf.com/public_html/dashboard/
```

## Step 5: Verify Everything Works

After uploading:

1. **Test Landing Page:**
   - Visit: `https://www.verishelf.com`
   - Should show the landing page with pricing

2. **Test Dashboard:**
   - Visit: `https://www.verishelf.com/dashboard/`
   - Should show the React dashboard (login page)

3. **Test API Connection:**
   - Try signing up on the landing page
   - Should connect to `https://api.verishelf.com/api` (or Heroku URL)
   - Check browser console (F12) for any errors

## Important Notes

### API URL Configuration

The frontend is already configured to use:
- `https://api.verishelf.com/api` for production
- `http://localhost:3000/api` for local development

Make sure `api.verishelf.com` DNS is pointing to Heroku (see `SETUP_API_SUBDOMAIN.md`)

### File Permissions

Make sure files have correct permissions:
- HTML/JS/CSS files: `644` (readable by web server)
- Directories: `755` (executable by web server)

### SSL/HTTPS

DreamHost should automatically provide SSL certificates. Make sure HTTPS is enabled in your domain settings.

## Quick Checklist

- [ ] Built the frontend: `npm run build`
- [ ] Uploaded `website/index.html` → `public_html/index.html`
- [ ] Uploaded `website/main.js` → `public_html/main.js`
- [ ] Uploaded `website/style.css` → `public_html/style.css`
- [ ] Created `public_html/dashboard/` directory
- [ ] Uploaded `dist/` contents → `public_html/dashboard/`
- [ ] Tested: `https://www.verishelf.com` (landing page)
- [ ] Tested: `https://www.verishelf.com/dashboard/` (dashboard)
- [ ] Verified API connection works
- [ ] Checked browser console for errors

## Troubleshooting

### Dashboard shows blank page
- Check browser console (F12) for errors
- Verify `dist/assets/` files are uploaded correctly
- Check file paths in `dist/index.html` match uploaded structure

### API calls failing
- Verify `api.verishelf.com` DNS is configured
- Check `API_BASE_URL` in `website/main.js` is correct
- Test API directly: `https://api.verishelf.com/api/health`

### CSS/JS not loading
- Check file permissions (should be 644)
- Verify file paths are correct
- Check browser Network tab for 404 errors

## Next Steps After Upload

1. ✅ Test the full signup flow
2. ✅ Test payment processing
3. ✅ Set up Stripe webhook: `https://api.verishelf.com/api/webhook`
4. ✅ Test end-to-end: Signup → Payment → Dashboard access

