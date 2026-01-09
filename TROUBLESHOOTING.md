# Payment Error Troubleshooting

## Common Error: "An error occurred. Please try again."

### Step 1: Check if Backend Server is Running

The payment flow requires the backend server to be running. Check:

1. **Is the server running?**
   ```bash
   # In a terminal, run:
   npm run server
   ```
   
   You should see:
   ```
   🚀 VeriShelf Payment Server running on port 3000
   ```

2. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check if you see: "Failed to fetch" or "NetworkError"
   - This usually means the backend server is not running

### Step 2: Verify Environment Variables

Make sure your `.env` file exists and has the test secret key:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
PORT=3000
```

Get your test secret key from: https://dashboard.stripe.com/test/apikeys

### Step 3: Check API URL

The frontend is configured to call `http://localhost:3000/api`. Make sure:
- Backend server is running on port 3000
- No firewall blocking localhost:3000
- CORS is enabled (should be in server.js)

### Step 4: Test Backend Directly

Test if the backend is responding:

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Step 5: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for error messages
2. **Network tab** - Check if the request to `/api/create-checkout-session` is:
   - Being made
   - What status code it returns
   - What the response body contains

### Common Issues

1. **"Failed to fetch" or "NetworkError"**
   - Backend server is not running
   - Solution: Run `npm run server` in a terminal

2. **"Missing required fields"**
   - Email not found in signup data
   - Solution: Make sure you completed the signup form before payment

3. **"Stripe secret key not set"**
   - `.env` file missing or incorrect
   - Solution: Create `.env` file with `STRIPE_SECRET_KEY`

4. **CORS errors**
   - Backend not allowing requests from frontend
   - Solution: Check that `cors()` middleware is in server.js

### Quick Test

1. Start backend: `npm run server`
2. Start frontend: `npm run dev` (in another terminal)
3. Open browser: `http://localhost:5173`
4. Try payment flow
5. Check browser console for detailed error messages

The improved error handling will now show you the exact error message instead of a generic one!

