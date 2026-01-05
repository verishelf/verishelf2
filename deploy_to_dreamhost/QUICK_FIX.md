# Quick Fix: Dashboard Not Showing

## The Problem
You uploaded `dist/` files but they're not showing because they need to be in a `dashboard/` folder.

## The Solution (3 Steps)

### Step 1: Create Dashboard Folder on DreamHost

**Via SFTP:**
1. Connect to your DreamHost server
2. Navigate to `/home/username/verishelf.com/`
3. Create a new folder named `dashboard`
4. Inside `dashboard`, create another folder named `assets`

**Via SSH:**
```bash
ssh username@verishelf.com
mkdir -p ~/verishelf.com/dashboard/assets
```

### Step 2: Move/Upload Files to Correct Location

**If you already uploaded files to root:**
```bash
ssh username@verishelf.com
cd ~/verishelf.com

# Move index.html to dashboard folder (if it exists in root)
mv index.html dashboard/ 2>/dev/null || true

# Move assets folder to dashboard (if it exists in root)
mv assets dashboard/ 2>/dev/null || true
```

**Or upload fresh files:**
- Upload `dist/index.html` → `dashboard/index.html`
- Upload all files from `dist/assets/` → `dashboard/assets/`

### Step 3: Verify File Structure

```bash
ssh username@verishelf.com
cd ~/verishelf.com
ls -la
# Should see: index.html, main.js, style.css, .htaccess, dashboard/

ls -la dashboard/
# Should see: index.html, assets/

ls -la dashboard/assets/
# Should see: All .js and .css files
```

## Expected File Structure

```
/home/username/verishelf.com/
├── index.html          ← Landing page (root)
├── main.js
├── style.css
├── .htaccess
└── dashboard/          ← Dashboard folder
    ├── index.html      ← React app
    └── assets/         ← React assets
        ├── *.js
        └── *.css
```

## Test URLs

After fixing:
- ✅ https://www.verishelf.com → Landing page
- ✅ https://www.verishelf.com/dashboard/ → React dashboard
- ✅ https://www.verishelf.com/dashboard/assets/index-BdREZHiY.js → Should load JS

## Still Not Working?

Check browser console (F12) for errors. Common issues:

1. **404 on assets**: Files not in `dashboard/assets/` folder
2. **Blank page**: `dashboard/index.html` missing or wrong location
3. **403 Forbidden**: File permissions issue (run `chmod 644` on files)

