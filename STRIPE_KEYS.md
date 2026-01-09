# Stripe API Keys

## Test Keys (Currently Active)
- **Publishable Key**: Set in `website/main.js` (test key)
- **Secret Key**: Set in `.env` file as `STRIPE_SECRET_KEY` (test key)

## Live Keys (For Production - Stored Securely)
- **Publishable Key**: Stored in code comments in `website/main.js`
- **Secret Key**: Stored in `.env` file (not committed to Git)

⚠️ **IMPORTANT**: Never commit secret keys to Git. Use environment variables.

## Setup Instructions

### For Testing (Current Setup)
1. Frontend (`website/main.js`): Uses test publishable key (already set)
2. Backend (`.env` file): Set `STRIPE_SECRET_KEY` to your test secret key from Stripe Dashboard
   - Get it from: https://dashboard.stripe.com/test/apikeys
   - Format: `sk_test_...`

### For Production
1. Update `website/main.js`: Change `STRIPE_PUBLISHABLE_KEY` to live key
2. Update `.env` file: Change `STRIPE_SECRET_KEY` to live secret key
3. Update webhook endpoint in Stripe Dashboard to production URL

## Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`
- Use any future expiry date and any CVC

