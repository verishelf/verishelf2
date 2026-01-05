# VeriShelf Deployment Guide

## ✅ Configuration Complete

Your Stripe integration is now configured for production on **www.verishelf.com**.

### Files Configured:

1. **`.env` file** - Created in `/deploy_to_dreamhost/server/.env` with:
   - Stripe Secret Key
   - Stripe Price IDs (Professional & Enterprise)
   - Production environment settings

2. **Website Configuration** - Updated in `/deploy_to_dreamhost/website/index.html`:
   - Stripe Publishable Key: `pk_test_51SkhdR9ELeRLvDS57hteUCEnMzmsWIGbY5VECFeRHLKShcU6j9144UwCsO6o2TIgDdMWJ7uCKu37Djo5ceTXdd8J00kdAi7eNV`
   - API URL: `https://www.verishelf.com/api`

3. **Stripe Products Created**:
   - Professional Plan: `price_1Skp5n9ELeRLvDS5OU02TPee` ($199/month per location)
   - Enterprise Plan: `price_1Skp5o9ELeRLvDS5s3Xpel33` ($399/month per location)
   - Volume discount coupons: 5%, 10%, 15%, 20%, 25%

## 🚀 Deployment Steps

### For DreamHost (Passenger/Node.js):

1. **Upload Files**:
   ```bash
   # Upload the entire deploy_to_dreamhost folder to your server
   # Structure should be:
   # /home/username/verishelf.com/
   #   ├── server/
   #   │   ├── server.js
   #   │   ├── package.json
   #   │   ├── .env
   #   │   └── node_modules/
   #   └── website/
   #       ├── index.html
   #       ├── main.js
   #       └── style.css
   ```

2. **Set Up Node.js App**:
   - In DreamHost panel, create a Node.js app
   - Point it to `/home/username/verishelf.com/server`
   - Set the entry point to `server.js`
   - Make sure Passenger is enabled

3. **Install Dependencies** (on server):
   ```bash
   cd /home/username/verishelf.com/server
   npm install --production
   ```

4. **Set Up Website Files**:
   - Point your domain's document root to `/home/username/verishelf.com/website`
   - Or configure your web server to serve static files from that directory

5. **Environment Variables**:
   - Make sure `.env` file is in the server directory
   - DreamHost Passenger will automatically load it

6. **SSL Certificate**:
   - Ensure SSL is enabled for www.verishelf.com
   - Stripe requires HTTPS in production

## 🔧 Testing

### Test the Backend:
```bash
curl https://www.verishelf.com/api/health
```

### Test Stripe Integration:
1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date, any CVC, any ZIP

2. Test the full flow:
   - Go to www.verishelf.com
   - Select a plan
   - Enter number of locations
   - Complete signup and payment

## 📋 Stripe Webhook Setup

For production, set up webhooks in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://www.verishelf.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## 🔐 Security Notes

- ✅ Stripe keys are configured
- ✅ CORS is set for production domain
- ✅ HTTPS required (Stripe requirement)
- ⚠️ Make sure `.env` file is not publicly accessible
- ⚠️ Consider using DreamHost's environment variable feature instead of `.env` file

## 📊 Pricing Structure

- **Professional**: $199/month per location
- **Enterprise**: $399/month per location
- **Volume Discounts**:
  - 11-25 locations: 5% off
  - 26-50 locations: 10% off
  - 51-100 locations: 15% off
  - 101-200 locations: 20% off
  - 201+ locations: 25% off

## 🐛 Troubleshooting

### Server not starting:
- Check `.env` file exists and has correct keys
- Check Node.js version (should be 18+)
- Check Passenger logs: `/home/username/logs/verishelf.com/error.log`

### Payments not working:
- Verify Stripe keys are correct
- Check browser console for errors
- Verify API URL is correct in `index.html`
- Check server logs for API errors

### CORS errors:
- Verify domain is in CORS whitelist in `server.js`
- Check that requests are coming from www.verishelf.com

## 📞 Support

For issues, check:
- Server logs: `/home/username/logs/verishelf.com/`
- Stripe Dashboard: https://dashboard.stripe.com/test/logs
- Browser console for frontend errors

