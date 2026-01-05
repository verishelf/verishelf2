# Upload Checklist for DreamHost

## ✅ Critical: File Structure on DreamHost

Your files MUST be in this exact structure:

```
/home/username/verishelf.com/          ← Root directory
├── index.html                        ← Landing page (from deploy_to_dreamhost/website/index.html)
├── main.js                           ← Landing page JS (from deploy_to_dreamhost/website/main.js)
├── style.css                         ← Landing page CSS (from deploy_to_dreamhost/website/style.css)
├── .htaccess                         ← Apache config (from deploy_to_dreamhost/.htaccess)
│
├── dashboard/                        ← CREATE THIS FOLDER!
│   ├── index.html                    ← From dist/index.html
│   └── assets/                        ← CREATE THIS FOLDER!
│       ├── index-BdREZHiY.js         ← From dist/assets/
│       ├── index-BH06e4S-.css        ← From dist/assets/
│       ├── index.es-DJgxw3lM.js      ← From dist/assets/
│       ├── html2canvas.esm-CBrSDip1.js ← From dist/assets/
│       └── purify.es-B9ZVCkUG.js     ← From dist/assets/
│
└── server/                           ← Backend (from deploy_to_dreamhost/server/)
    ├── server.js
    ├── package.json
    └── .env
```

## 📤 Upload Instructions

### Method 1: Using SFTP Client (FileZilla, Cyberduck, etc.)

1. **Connect to DreamHost**:
   - Host: `verishelf.com` or your DreamHost server IP
   - Username: Your DreamHost username
   - Password: Your DreamHost password
   - Port: 22 (SFTP)

2. **Navigate to**: `/home/username/verishelf.com/`

3. **Upload Landing Page Files** (to root):
   - `deploy_to_dreamhost/website/index.html` → Upload to root
   - `deploy_to_dreamhost/website/main.js` → Upload to root
   - `deploy_to_dreamhost/website/style.css` → Upload to root
   - `deploy_to_dreamhost/.htaccess` → Upload to root

4. **Create Dashboard Folder**:
   - Right-click in root → Create Folder → Name it `dashboard`

5. **Upload Dashboard Files**:
   - `dist/index.html` → Upload to `dashboard/` folder
   - Create `assets` folder inside `dashboard/`
   - Upload ALL files from `dist/assets/` → `dashboard/assets/`

### Method 2: Using SSH/SCP

```bash
# From your local machine
cd /Users/apple/Desktop/VeriShelf

# Create dashboard folder on server
ssh username@verishelf.com "mkdir -p ~/verishelf.com/dashboard/assets"

# Upload landing page files
scp deploy_to_dreamhost/website/index.html username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/website/main.js username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/website/style.css username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/.htaccess username@verishelf.com:~/verishelf.com/

# Upload dashboard files
scp dist/index.html username@verishelf.com:~/verishelf.com/dashboard/
scp -r dist/assets/* username@verishelf.com:~/verishelf.com/dashboard/assets/
```

## 🔍 Verify Upload

SSH into your server and check:

```bash
ssh username@verishelf.com
cd ~/verishelf.com

# Check root files
ls -la
# Should see: index.html, main.js, style.css, .htaccess

# Check dashboard folder
ls -la dashboard/
# Should see: index.html

# Check assets folder
ls -la dashboard/assets/
# Should see: All the .js and .css files
```

## ⚠️ Common Mistakes

❌ **Mistake 1**: Uploading `dist/` folder directly
- **Wrong**: `/home/username/verishelf.com/dist/index.html`
- **Right**: `/home/username/verishelf.com/dashboard/index.html`

❌ **Mistake 2**: Not creating `dashboard/` folder
- **Wrong**: Files in root or wrong location
- **Right**: Files must be in `/dashboard/` folder

❌ **Mistake 3**: Assets folder in wrong place
- **Wrong**: `/home/username/verishelf.com/assets/`
- **Right**: `/home/username/verishelf.com/dashboard/assets/`

❌ **Mistake 4**: .htaccess file not uploaded
- **Wrong**: Missing .htaccess file
- **Right**: .htaccess must be in root directory

## 🧪 Test After Upload

1. **Test Landing Page**: https://www.verishelf.com
   - Should show marketing page

2. **Test Dashboard**: https://www.verishelf.com/dashboard/
   - Should show React app
   - Open browser console (F12) to check for errors

3. **Test Assets**: 
   - https://www.verishelf.com/dashboard/assets/index-BdREZHiY.js
   - Should load the JavaScript file (not 404)

## 🐛 If Still Not Working

1. **Check File Permissions**:
   ```bash
   ssh username@verishelf.com
   cd ~/verishelf.com
   chmod 644 index.html main.js style.css .htaccess
   chmod 755 dashboard
   chmod 644 dashboard/index.html
   chmod 755 dashboard/assets
   chmod 644 dashboard/assets/*
   ```

2. **Check .htaccess is Working**:
   - Try accessing: https://www.verishelf.com/dashboard/test
   - Should serve `dashboard/index.html` (not 404)

3. **Check DreamHost Error Logs**:
   ```bash
   tail -f ~/logs/verishelf.com/error.log
   ```

4. **Verify Domain Configuration**:
   - DreamHost Panel → Domains → Manage Domains
   - Check that verishelf.com points to `/home/username/verishelf.com/`

