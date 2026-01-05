# Where to Upload Files on verishelf.com

## 📍 Finding Your DreamHost Directory

### Method 1: Check DreamHost Panel
1. Log into **DreamHost Panel**: https://panel.dreamhost.com
2. Go to **Domains** → **Manage Domains**
3. Click on **verishelf.com** (or www.verishelf.com)
4. Look for **Web directory** - this shows your upload path
5. Usually it's: `/home/username/verishelf.com/`

### Method 2: Check via SSH
```bash
ssh username@verishelf.com
pwd  # Shows current directory
# Or check:
ls -la ~/verishelf.com/
```

## 📂 Upload Structure

Upload your files to this structure on DreamHost:

```
/home/username/verishelf.com/          ← THIS IS YOUR ROOT (upload landing page here)
├── index.html                        ← Upload from: deploy_to_dreamhost/website/index.html
├── main.js                           ← Upload from: deploy_to_dreamhost/website/main.js
├── style.css                         ← Upload from: deploy_to_dreamhost/website/style.css
├── .htaccess                         ← Upload from: deploy_to_dreamhost/.htaccess
├── app/                              ← CREATE THIS FOLDER, upload React app here
│   ├── index.html                    ← Upload from: dist/index.html
│   └── assets/                        ← Upload from: dist/assets/
│       ├── *.js files
│       └── *.css files
└── server/                           ← CREATE THIS FOLDER, upload backend here
    ├── server.js                     ← Upload from: deploy_to_dreamhost/server/server.js
    ├── package.json                  ← Upload from: deploy_to_dreamhost/server/package.json
    ├── .env                          ← Upload from: deploy_to_dreamhost/server/.env
    └── (node_modules will be installed on server)
```

## 📤 Step-by-Step Upload Instructions

### Step 1: Upload Landing Page Files (Root)

**Location on DreamHost**: `/home/username/verishelf.com/`

**Files to upload**:
- `deploy_to_dreamhost/website/index.html` → `index.html`
- `deploy_to_dreamhost/website/main.js` → `main.js`
- `deploy_to_dreamhost/website/style.css` → `style.css`
- `deploy_to_dreamhost/.htaccess` → `.htaccess`

### Step 2: Create and Upload React App

**Location on DreamHost**: `/home/username/verishelf.com/app/`

**Steps**:
1. First, build your React app locally:
   ```bash
   cd /Users/apple/Desktop/VeriShelf
   npm run build
   ```

2. Create `app` folder on DreamHost (via SFTP or SSH)

3. Upload all files from `dist/` folder:
   - `dist/index.html` → `app/index.html`
   - `dist/assets/*` → `app/assets/*`

### Step 3: Create and Upload Backend Server

**Location on DreamHost**: `/home/username/verishelf.com/server/`

**Files to upload**:
- `deploy_to_dreamhost/server/server.js` → `server/server.js`
- `deploy_to_dreamhost/server/package.json` → `server/package.json`
- `deploy_to_dreamhost/server/.env` → `server/.env` (IMPORTANT: Keep this secure!)

## 🔧 Using SFTP Client (Recommended)

### FileZilla / Cyberduck / WinSCP

1. **Connect to server**:
   - Host: `verishelf.com` (or your DreamHost server IP)
   - Username: Your DreamHost username
   - Password: Your DreamHost password
   - Port: 22 (SFTP)

2. **Navigate to**: `/home/username/verishelf.com/`

3. **Upload files**:
   - Drag and drop files maintaining the folder structure
   - Create `app/` and `server/` folders if they don't exist

## 🔧 Using Command Line (SSH/SCP)

```bash
# From your local machine
cd /Users/apple/Desktop/VeriShelf

# Upload landing page files
scp deploy_to_dreamhost/website/index.html username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/website/main.js username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/website/style.css username@verishelf.com:~/verishelf.com/
scp deploy_to_dreamhost/.htaccess username@verishelf.com:~/verishelf.com/

# Create app directory and upload React app
ssh username@verishelf.com "mkdir -p ~/verishelf.com/app"
scp -r dist/* username@verishelf.com:~/verishelf.com/app/

# Create server directory and upload backend
ssh username@verishelf.com "mkdir -p ~/verishelf.com/server"
scp deploy_to_dreamhost/server/server.js username@verishelf.com:~/verishelf.com/server/
scp deploy_to_dreamhost/server/package.json username@verishelf.com:~/verishelf.com/server/
scp deploy_to_dreamhost/server/.env username@verishelf.com:~/verishelf.com/server/
```

## ⚠️ Important Notes

1. **Replace `username`** with your actual DreamHost username
2. **The root directory** is where `index.html` goes - this is your landing page
3. **Create folders** `app/` and `server/` if they don't exist
4. **File permissions**: After uploading, you may need to set permissions:
   ```bash
   ssh username@verishelf.com
   chmod 644 ~/verishelf.com/index.html
   chmod 755 ~/verishelf.com/app
   chmod 755 ~/verishelf.com/server
   ```

## ✅ Verify Upload

After uploading, verify the structure:

```bash
ssh username@verishelf.com
cd ~/verishelf.com
ls -la
# Should see: index.html, main.js, style.css, .htaccess, app/, server/

ls -la app/
# Should see: index.html, assets/

ls -la server/
# Should see: server.js, package.json, .env
```

## 🎯 Quick Reference

| Local File | DreamHost Location |
|------------|-------------------|
| `deploy_to_dreamhost/website/index.html` | `/home/username/verishelf.com/index.html` |
| `deploy_to_dreamhost/website/main.js` | `/home/username/verishelf.com/main.js` |
| `deploy_to_dreamhost/website/style.css` | `/home/username/verishelf.com/style.css` |
| `deploy_to_dreamhost/.htaccess` | `/home/username/verishelf.com/.htaccess` |
| `dist/index.html` | `/home/username/verishelf.com/app/index.html` |
| `dist/assets/*` | `/home/username/verishelf.com/app/assets/*` |
| `deploy_to_dreamhost/server/*` | `/home/username/verishelf.com/server/*` |

## 🚨 Common Mistakes

❌ **Don't upload the entire project folder** - only specific files
❌ **Don't upload `node_modules`** - install on server instead
❌ **Don't upload `src/` folder** - only upload built `dist/` files
✅ **Do upload** only the files listed above
✅ **Do create** `app/` and `server/` folders on the server
✅ **Do build** React app first (`npm run build`) before uploading

