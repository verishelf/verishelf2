# Set Heroku Environment Variables - DO THIS NOW

## Quick Method: Use the Script

1. **Login to Heroku first:**
   ```bash
   heroku login
   ```
   (This will open a browser for you to login)

2. **Run the script:**
   ```bash
   ./set-heroku-vars.sh
   ```

## OR: Manual Method via Dashboard (No Login Needed)

1. Go to: **https://dashboard.heroku.com/apps/verishelf/settings**

2. Click **"Reveal Config Vars"**

3. Add these variables (click "Add" after each one):

   **Variable 1:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_live_YOUR_LIVE_SECRET_KEY_HERE`

   **Variable 2:**
   - Key: `SUPABASE_URL`
   - Value: `https://bblwhwobkthawkbyhiwb.supabase.co`

   **Variable 3:**
   - Key: `SUPABASE_ANON_KEY`
   - Value: `sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS`

4. **The app will restart automatically** after you add the variables

5. **Test it:** Visit https://verishelf.herokuapp.com/api/health

## After Setting Variables

✅ The app should work now!
✅ Test: https://verishelf.herokuapp.com/api/health
✅ Should return: `{"status":"ok","timestamp":"..."}`

## Later: Add Webhook Secret

After you set up the Stripe webhook, add:
- Key: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_...` (from Stripe Dashboard)

