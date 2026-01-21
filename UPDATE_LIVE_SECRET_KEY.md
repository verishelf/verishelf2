# ⚠️ IMPORTANT: Update Backend Secret Key to Live

## Frontend ✅ DONE
The frontend (`website/main.js`) has been updated to use the live publishable key:
- `pk_live_YOUR_PUBLISHABLE_KEY_HERE`

## Backend ⚠️ ACTION REQUIRED

You need to update the **Stripe Secret Key** in two places:

### 1. Local `.env` file
Update your local `.env` file:
```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
```

### 2. Heroku Config Vars
Update the Heroku environment variable:

**Option A: Via Heroku Dashboard**
1. Go to https://dashboard.heroku.com/apps/verishelf/settings
2. Click "Reveal Config Vars"
3. Find `STRIPE_SECRET_KEY`
4. Click the edit icon (pencil)
5. Update the value to: `sk_live_YOUR_LIVE_SECRET_KEY_HERE`
6. Click "Save"

**Option B: Via Heroku CLI**
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE --app verishelf
```

## ⚠️ Important Notes

1. **Webhook Secret**: You'll also need to update the webhook secret in Stripe Dashboard:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Find your webhook endpoint: `https://verishelf-e0b90033152c.herokuapp.com/api/webhook`
   - Copy the **Signing secret** (starts with `whsec_`)
   - Update `STRIPE_WEBHOOK_SECRET` in Heroku Config Vars

2. **Test vs Live**: Make sure you're using the **live** webhook secret, not the test one.

3. **After updating**: The Heroku app will automatically restart. No need to redeploy.

## Verify It's Working

After updating:
1. Try a test checkout on `https://verishelf.com`
2. Check Heroku logs: `heroku logs --tail --app verishelf`
3. Verify no "invalid api key" errors appear
