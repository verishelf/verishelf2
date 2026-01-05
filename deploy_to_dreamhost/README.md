# VeriShelf Deployment Package

This folder contains all files needed to deploy VeriShelf to verishelf.com.

## 📁 Folder Structure

```
deploy_to_dreamhost/
├── website/              # Landing page files (upload to root)
│   ├── index.html       # Main landing page
│   ├── main.js          # Landing page JavaScript
│   └── style.css        # Landing page styles
├── server/              # Backend API (upload to /server/)
│   ├── server.js        # Express server
│   ├── package.json     # Node.js dependencies
│   ├── setup-stripe-products.js  # Stripe setup script
│   └── .env            # Environment variables (create this)
├── .htaccess            # Apache configuration
└── [deployment docs]    # Various deployment guides
```

## 🚀 Quick Start

1. **Build React App**:
   ```bash
   cd /Users/apple/Desktop/VeriShelf
   npm run build
   ```

2. **Upload Files**:
   - Landing page: `website/*` → `/home/username/verishelf.com/`
   - React app: `dist/*` → `/home/username/verishelf.com/app/`
   - Backend: `server/*` → `/home/username/verishelf.com/server/`
   - Config: `.htaccess` → `/home/username/verishelf.com/`

3. **Configure Server**:
   - Create `.env` in `server/` with Stripe keys
   - Install dependencies: `cd server && npm install`
   - Set up Passenger in DreamHost panel

## 📚 Documentation

- **QUICK_DEPLOY.md** - Quick reference guide
- **DEPLOYMENT_COMPLETE.md** - Detailed deployment instructions
- **UPLOAD_LOCATIONS.md** - Exact file locations and paths

## ✅ What's Included

- ✅ Landing page with Stripe integration
- ✅ Backend API server
- ✅ Stripe products setup script
- ✅ Apache configuration (.htaccess)
- ✅ All deployment documentation

## 🔑 Required Configuration

Before deploying, you need:

1. **Stripe Keys** (already configured in files):
   - Publishable: `pk_test_51SkhdR9ELeRLvDS57hteUCEnMzmsWIGbY5VECFeRHLKShcU6j9144UwCsO6o2TIgDdMWJ7uCKu37Djo5ceTXdd8J00kdAi7eNV`
   - Secret: Set in `server/.env`

2. **Stripe Price IDs** (run setup script or use existing):
   - Professional: `price_1Skp5n9ELeRLvDS5OU02TPee`
   - Enterprise: `price_1Skp5o9ELeRLvDS5s3Xpel33`

3. **API URL**: Already set to `https://www.verishelf.com/api`

## 📝 Next Steps

See **QUICK_DEPLOY.md** for step-by-step instructions!

