# Dashboard Troubleshooting

## Issue: Blank Dashboard Screen

If the dashboard shows a blank screen after logging in, try these steps:

### 1. Restart the Development Server
```bash
# Stop the server (Ctrl+C) and restart:
npm run dev
```

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 3. Check Browser Console
Open browser DevTools (F12) and check for errors:
- JavaScript errors
- Failed network requests
- CORS errors

### 4. Verify Authentication
The dashboard requires authentication. If you're not logged in, it will redirect to `/`.

Check:
- Is there a user session in localStorage?
- Open DevTools → Application → Local Storage → Check for `verishelf_user`

### 5. Check Network Tab
- Are assets loading correctly?
- Are there 404 errors for JavaScript/CSS files?
- Check if `/dashboard/src/main.jsx` is loading

### 6. Verify Base Path
The dashboard should be accessible at:
- Development: `http://localhost:5173/dashboard/`
- Make sure you include the trailing slash

### 7. Check Supabase Connection
The dashboard needs Supabase to be initialized. Check:
- Is Supabase script loading? (should be in `<head>`)
- Are there Supabase connection errors in console?

### 8. Common Issues

**Issue: Immediate redirect to `/`**
- Cause: Authentication check failing
- Solution: Make sure you're logged in via the website first

**Issue: Loading spinner never finishes**
- Cause: Supabase connection issue or authentication hanging
- Solution: Check browser console for errors

**Issue: White screen with no errors**
- Cause: React app not mounting
- Solution: Check if `#root` element exists in HTML

### 9. Manual Test
Try accessing the dashboard directly:
1. Make sure you're logged in (check localStorage)
2. Visit `http://localhost:5173/dashboard/`
3. Check browser console for any errors

### 10. Reset Everything
If nothing works:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```
