# Troubleshooting: Dashboard Not Showing on DreamHost

## Common Issues and Solutions

### Issue 1: Files in Wrong Location

**Problem**: Dashboard files not in `/dashboard/` folder

**Solution**: Make sure your file structure on DreamHost is:
```
/home/username/verishelf.com/
├── index.html          ← Landing page (root)
├── main.js
├── style.css
├── .htaccess
├── dashboard/          ← CREATE THIS FOLDER
│   ├── index.html      ← From dist/index.html
│   └── assets/         ← From dist/assets/
│       ├── *.js
│       └── *.css
└── server/             ← Backend API
    └── ...
```

### Issue 2: .htaccess Not Working

**Problem**: DreamHost might not have mod_rewrite enabled or .htaccess is being ignored

**Solution**: 
1. Check if `.htaccess` file exists in root
2. Verify it's not named `.htaccess.txt` (should be exactly `.htaccess`)
3. Check DreamHost panel → Domains → Manage Domains → Edit → "Allow .htaccess files"

### Issue 3: Asset Paths Not Loading

**Problem**: JavaScript/CSS files return 404

**Solution**: 
1. Verify assets folder is at: `/home/username/verishelf.com/dashboard/assets/`
2. Check file permissions: `chmod 644` for files, `chmod 755` for directories
3. Verify the paths in `dashboard/index.html` match the actual file structure

### Issue 4: Need to Rebuild

**Problem**: Old build files without `/dashboard/` base path

**Solution**: Rebuild the React app:
```bash
cd /Users/apple/Desktop/VeriShelf
npm run build
```

Then upload the NEW files from `dist/` folder.

## Step-by-Step Upload Checklist

### ✅ Step 1: Rebuild (if needed)
```bash
cd /Users/apple/Desktop/VeriShelf
npm run build
```

### ✅ Step 2: Create Dashboard Folder on DreamHost
Via SFTP or SSH:
```bash
ssh username@verishelf.com
mkdir -p ~/verishelf.com/dashboard/assets
```

### ✅ Step 3: Upload Files
Upload these files maintaining structure:

**From your local `dist/` folder:**
- `dist/index.html` → `/home/username/verishelf.com/dashboard/index.html`
- `dist/assets/*` → `/home/username/verishelf.com/dashboard/assets/*`

**From `deploy_to_dreamhost/website/`:**
- `index.html` → `/home/username/verishelf.com/index.html` (root)
- `main.js` → `/home/username/verishelf.com/main.js` (root)
- `style.css` → `/home/username/verishelf.com/style.css` (root)
- `.htaccess` → `/home/username/verishelf.com/.htaccess` (root)

### ✅ Step 4: Set File Permissions
```bash
ssh username@verishelf.com
cd ~/verishelf.com
chmod 644 index.html main.js style.css .htaccess
chmod 755 dashboard
chmod 644 dashboard/index.html
chmod 755 dashboard/assets
chmod 644 dashboard/assets/*
```

### ✅ Step 5: Test URLs

1. **Landing Page**: https://www.verishelf.com
   - Should show the marketing page

2. **Dashboard**: https://www.verishelf.com/dashboard/
   - Should show the React app
   - Check browser console (F12) for errors

3. **Assets**: https://www.verishelf.com/dashboard/assets/index-*.js
   - Should load JavaScript file (not 404)

## Debugging Steps

### Check File Structure via SSH
```bash
ssh username@verishelf.com
cd ~/verishelf.com
ls -la
ls -la dashboard/
ls -la dashboard/assets/
```

### Check Browser Console
1. Open https://www.verishelf.com/dashboard/
2. Press F12 to open Developer Tools
3. Check Console tab for errors
4. Check Network tab to see which files are failing to load

### Check .htaccess
```bash
ssh username@verishelf.com
cat ~/verishelf.com/.htaccess
```

### Test Direct File Access
Try accessing files directly:
- https://www.verishelf.com/dashboard/index.html
- https://www.verishelf.com/dashboard/assets/index-BdREZHiY.js

If these work but `/dashboard/` doesn't, it's an .htaccess issue.

## DreamHost-Specific Issues

### Issue: Passenger Interfering
If you have Passenger enabled for Node.js, it might be intercepting requests.

**Solution**: Make sure Passenger is only enabled for `/server/` directory, not the root.

### Issue: PHP Handler
DreamHost might be trying to process HTML as PHP.

**Solution**: Add to `.htaccess`:
```apache
# Don't process HTML as PHP
RemoveHandler .html .htm
```

### Issue: Directory Index
DreamHost might not be serving index.html by default.

**Solution**: Add to `.htaccess`:
```apache
DirectoryIndex index.html
```

## Quick Fix: Simplified .htaccess

If the current .htaccess isn't working, try this simplified version:

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Dashboard - serve index.html for all routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/dashboard
RewriteRule ^dashboard/(.*)$ /dashboard/index.html [L]

# Root - serve landing page
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ index.html [L]
```

## Still Not Working?

1. **Check DreamHost Error Logs**:
   ```bash
   ssh username@verishelf.com
   tail -f ~/logs/verishelf.com/error.log
   ```

2. **Verify Domain Configuration**:
   - DreamHost Panel → Domains → Manage Domains
   - Check that verishelf.com is pointing to the correct directory

3. **Test with Simple HTML**:
   Create a test file: `/dashboard/test.html` with just "Hello World"
   - If this works, the issue is with the React app paths
   - If this doesn't work, the issue is with folder structure/permissions

4. **Check Base Path**:
   Make sure `vite.config.js` has: `base: '/dashboard/'`
   Then rebuild: `npm run build`

