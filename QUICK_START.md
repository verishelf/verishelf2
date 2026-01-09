# Quick Start Guide

## Running the Application

You need **TWO terminals** running simultaneously:

### Terminal 1: Backend Server
```bash
npm run server
```
Should show: `🚀 VeriShelf Payment Server running on port 3000`

### Terminal 2: Frontend
```bash
npm run dev
```
Should show: `Local: http://localhost:5173`

## Testing the Payment Flow

1. **Open your browser**: Go to `http://localhost:5173`

2. **Select locations**: Enter number of locations (e.g., 5)

3. **Click "Get Started"** or "Create Account"

4. **Choose a plan**: Professional or Enterprise

5. **Fill in signup form**:
   - Name
   - Email
   - Password
   - Company (optional)

6. **Click "Subscribe Now"**

7. **Enter test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

8. **Complete payment** on Stripe Checkout page

9. **You'll be redirected** back to `/dashboard/`

## What Should Happen

✅ Products created in Stripe Dashboard → Products
✅ Subscription created in Supabase
✅ User account created
✅ Redirected to dashboard

## Troubleshooting

- **"Cannot connect to payment server"**: Make sure `npm run server` is running
- **"Cannot POST /api/create-checkout-session"**: Backend not running or wrong port
- **Check browser console** (F12) for detailed error messages

