# VeriShelf Payment Server Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
   PORT=3000
   ```

3. **Get your Stripe Secret Key:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_`)
   - Add it to `.env` as `STRIPE_SECRET_KEY`

4. **Set up Stripe Webhook:**
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `http://localhost:3000/api/webhook` (for local testing)
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to `.env` as `STRIPE_WEBHOOK_SECRET`

5. **Start the server:**
   ```bash
   npm run server
   ```

6. **Start the frontend (in another terminal):**
   ```bash
   npm run dev
   ```

## How It Works

1. User selects plan and locations on the website
2. Frontend calculates the total monthly price
3. Frontend calls `/api/create-checkout-session` with the amount
4. Backend creates a Stripe Checkout Session
5. User is redirected to Stripe's hosted checkout page
6. After payment, Stripe sends a webhook to `/api/webhook`
7. Backend creates/updates the subscription in Supabase
8. User is redirected back to the dashboard

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

## Production Deployment

For production:
1. Update `API_BASE_URL` in `website/main.js` to your production server URL
2. Set up webhook endpoint in Stripe Dashboard with your production URL
3. Use production Stripe keys (`sk_live_...` instead of `sk_test_...`)
4. Deploy server to a hosting service (Heroku, Railway, Render, etc.)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Recommended |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `PORT` | Server port | No (defaults to 3000) |

