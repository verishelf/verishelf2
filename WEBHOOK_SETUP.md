# Webhook Setup Guide

## Current Status

You've set up a webhook endpoint in Stripe and received a signing secret. Here's how to complete the setup:

## Step 1: Fix the API Key Error First

The "Invalid API Key" error means your Stripe secret key in `.env` is incorrect. 

### Get the Correct Test Key:

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy the **Secret key** (starts with `sk_test_`)
4. It should look like: `sk_test_YOUR_SECRET_KEY_HERE`

### Update Your `.env` File:

Open `/Users/apple/Desktop/VeriShelf/.env` and make sure it looks exactly like this (no quotes, no spaces):

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

**Important:**
- No quotes around values
- No spaces before or after `=`
- Make sure the test key matches your Stripe test account

## Step 2: Add Webhook Secret

You already have the signing secret from Stripe: `whsec_b6QR0vwaYM8kuEjXpwR9M00vcVEgKSOL`

Add it to your `.env` file as shown above.

## Step 3: Configure Webhook Endpoint in Stripe

Since you're testing locally, Stripe can't reach `http://localhost:3000` directly. You have two options:

### Option A: Use Stripe CLI (Recommended for Local Testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. This will give you a **new signing secret** (starts with `whsec_`)
5. Update `STRIPE_WEBHOOK_SECRET` in `.env` with this new secret
6. Keep this terminal running while testing

### Option B: Use ngrok (For Testing with Real Stripe Webhooks)

1. Install ngrok: https://ngrok.com/download
2. Start your server: `npm run server`
3. In another terminal, expose your server:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Go to https://dashboard.stripe.com/test/webhooks
6. Edit your webhook endpoint
7. Update the endpoint URL to: `https://abc123.ngrok.io/api/webhook`
8. Save and use the signing secret from Stripe Dashboard

## Step 4: Verify Webhook Events

Make sure your webhook endpoint in Stripe Dashboard is listening to these events:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

## Step 5: Test the Setup

1. **Restart your server** (to load the new `.env` values):
   ```bash
   # Stop the server (Ctrl+C)
   npm run server
   ```

2. **Check the startup message** - you should see:
   ```
   ✅ Stripe Secret Key loaded: sk_test_...
   🚀 VeriShelf Payment Server running on port 3000
   ```

3. **Test a payment:**
   - Go to http://localhost:5173
   - Select locations and plan
   - Complete checkout with test card: `4242 4242 4242 4242`
   - Check server logs for webhook events

4. **Check webhook logs:**
   - If using Stripe CLI: You'll see events in the terminal
   - If using ngrok: Check Stripe Dashboard → Webhooks → Your endpoint → Events

## Troubleshooting

### "Invalid API Key" Error
- ✅ Make sure you're using the **test** key (starts with `sk_test_`)
- ✅ Verify the key matches your Stripe test account
- ✅ Check for extra spaces or quotes in `.env`
- ✅ Restart the server after changing `.env`

### Webhook Not Receiving Events
- ✅ Make sure webhook secret is set in `.env`
- ✅ If using Stripe CLI, keep `stripe listen` running
- ✅ If using ngrok, make sure ngrok is running and URL is updated in Stripe
- ✅ Check server logs for webhook errors

### Webhook Signature Verification Failed
- ✅ Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe
- ✅ If using Stripe CLI, use the secret it provides (not the dashboard secret)
- ✅ Restart server after updating webhook secret

## Production Setup

When deploying to production:

1. Use your **live** Stripe keys (`sk_live_...`)
2. Set up webhook endpoint with your production URL (e.g., `https://api.verishelf.com/api/webhook`)
3. Use the production webhook signing secret
4. Make sure your server is publicly accessible

## Quick Reference

**Your Webhook Signing Secret:** `whsec_YOUR_WEBHOOK_SECRET_HERE`

**Webhook Endpoint URL (local):** `http://localhost:3000/api/webhook`

**Webhook Endpoint URL (with ngrok):** `https://YOUR_NGROK_URL.ngrok.io/api/webhook`

