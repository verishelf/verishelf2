# Quick Deployment Guide for verishelf.com

## 🚀 Quick Start

### 1. Build React App
```bash
cd /Users/apple/Desktop/VeriShelf
npm run build
```

### 2. Run Deployment Script (Optional)
```bash
cd /Users/apple/Desktop/VeriShelf/deploy_to_dreamhost
chmod +x deploy.sh
./deploy.sh
```

This creates a deployment package in `~/verishelf_deployment_[timestamp]/`

### 3. Manual File Structure

If you prefer manual setup, create this structure:

```
/home/username/verishelf.com/          (DreamHost root)
├── index.html                        (Landing page)
├── main.js                           (Landing page JS)
├── style.css                         (Landing page CSS)
├── .htaccess                         (Apache config)
├── app/                              (React Dashboard)
│   ├── index.html
│   └── assets/
│       ├── *.js
│       └── *.css
└── server/                           (Backend API)
    ├── server.js
    ├── package.json
    ├── .env
    └── node_modules/                 (install on server)
```

## 📤 Upload Files

### Using SFTP (Recommended)
1. Use FileZilla, Cyberduck, or similar
2. Connect to: `verishelf.com` (or your DreamHost server)
3. Navigate to: `/home/username/verishelf.com/`
4. Upload files maintaining the structure above

### Using Command Line
```bash
# From your deployment package directory
scp -r * username@verishelf.com:/home/username/verishelf.com/
scp -r app/* username@verishelf.com:/home/username/verishelf.com/app/
scp -r server/* username@verishelf.com:/home/username/verishelf.com/server/
```

## ⚙️ DreamHost Configuration

### 1. Enable Passenger (Node.js)
- DreamHost Panel → Domains → Manage Domains
- Edit verishelf.com
- Enable **Passenger (Ruby/Node.js/Python apps)**
- **App directory**: `/home/username/verishelf.com/server`
- **App type**: `nodejs`
- **Startup file**: `server.js`

### 2. Install Dependencies
SSH into server:
```bash
ssh username@verishelf.com
cd ~/verishelf.com/server
npm install --production
```

### 3. Enable HTTPS
- DreamHost Panel → Domains → Manage Domains
- Edit verishelf.com
- Enable **Force HTTPS**

## ✅ Test

1. **Landing Page**: https://www.verishelf.com
2. **Dashboard**: https://www.verishelf.com/app/
3. **API**: https://www.verishelf.com/api/health

## 📝 Important Notes

- ✅ All redirect paths updated to `/app/`
- ✅ React app configured with base path `/app/`
- ✅ API URL set to `https://www.verishelf.com/api`
- ✅ Stripe keys configured
- ⚠️ Make `.env` file secure (not publicly accessible)
- ⚠️ Set file permissions: `chmod 644` for files, `chmod 755` for directories

## 🐛 Troubleshooting

**React app not loading?**
- Check `app/` folder exists
- Verify `.htaccess` rewrite rules
- Check browser console for 404s

**API not working?**
- Check Passenger is running
- Verify `.env` file exists
- Check logs: `~/logs/verishelf.com/error.log`

**Payment form issues?**
- Ensure HTTPS is enabled
- Verify Stripe keys in `.env`
- Check browser console

For detailed instructions, see `DEPLOYMENT_COMPLETE.md`

