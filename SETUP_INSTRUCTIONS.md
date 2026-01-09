# VeriShelf Payment Setup - Complete Instructions

## Overview

I've set up a complete Stripe payment processing system. Here's what you need to do:

## Step 1: Install Backend Dependencies

Run this command in your terminal:
```bash
npm install express cors dotenv @supabase/supabase-js
```

## Step 2: Stripe Secret Key

✅ **Your Stripe LIVE secret key has been added to `.env`**

⚠️ **IMPORTANT SECURITY NOTE:** 
- Your live key was shared in chat - consider rotating it for security
- The `.env` file is in `.gitignore` and will NOT be committed to Git
- For production, use your live key (`sk_live_...`)
- For testing, use test mode key (`sk_test_...`) from https://dashboard.stripe.com/test/apikeys

## Step 3: Create Environment File

Create a file named `.env` in the root directory with:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

**Important:** Replace `sk_test_YOUR_SECRET_KEY_HERE` with your actual Stripe secret key!

## Step 4: Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `http://localhost:3000/api/webhook` (for local testing)
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Step 5: Start the Backend Server

In one terminal, run:
```bash
npm run server
```

You should see:
```
🚀 VeriShelf Payment Server running on port 3000
```

## Step 6: Start the Frontend

In another terminal, run:
```bash
npm run dev
```

## Step 7: Test the Payment Flow

1. Go to http://localhost:5173
2. Select number of locations
3. Click "Get Started" or "Create Account"
4. Choose a plan (Professional or Enterprise)
5. Fill in account details
6. Click "Subscribe Now"
7. You'll be redirected to Stripe Checkout
8. Use test card: `4242 4242 4242 4242`
9. Use any future expiry date and any CVC
10. Complete the payment
11. You'll be redirected back to the dashboard

## How It Works

1. **User selects locations** → Price is calculated with discounts
2. **User clicks "Subscribe Now"** → Frontend calls `/api/create-checkout-session`
3. **Backend creates Stripe Checkout Session** → Returns session ID
4. **User redirected to Stripe** → Enters payment details
5. **Payment succeeds** → Stripe sends webhook to `/api/webhook`
6. **Backend processes webhook** → Creates/updates subscription in Supabase
7. **User redirected to dashboard** → Can now access their account

## Important Notes

- **User account must be created BEFORE checkout** (this happens in the signup form)
- The webhook creates/updates the subscription record after payment
- All payments are recurring monthly subscriptions
- Test mode uses test cards (won't charge real money)

## Troubleshooting

### Server won't start
- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Make sure port 3000 is not already in use

### Payment redirects but doesn't work
- Check browser console for errors
- Verify backend server is running on port 3000
- Check that `API_BASE_URL` in `website/main.js` is `http://localhost:3000/api`

### Webhook not working
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhook`
- Or use ngrok to expose your local server: `ngrok http 3000`

## Production Deployment

When ready for production:

1. Update `API_BASE_URL` in `website/main.js` to your production server URL
2. Use production Stripe keys (`sk_live_...` instead of `sk_test_...`)
3. Set up webhook endpoint in Stripe Dashboard with your production URL
4. Deploy server to hosting service (Heroku, Railway, Render, etc.)

## Files Created

- `server.js` - Backend Express server for Stripe payments
- `README_SERVER.md` - Detailed server documentation
- Updated `website/main.js` - Frontend now calls backend API
- Updated `package.json` - Added server dependencies and scripts

## Next Steps

1. Install dependencies: `npm install express cors dotenv @supabase/supabase-js`
2. Create `.env` file with your Stripe secret key
3. Set up webhook in Stripe Dashboard
4. Start server: `npm run server`
5. Test the payment flow!

