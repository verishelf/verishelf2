# Development Mode for API Keys

## Overview

VeriShelf includes a **development mode** that allows API key generation and usage without requiring an Enterprise plan subscription. This is useful for:

- Local development and testing
- Mobile app development
- Integration testing
- Prototyping

## How Development Mode Works

Development mode is automatically enabled when:

1. **NODE_ENV is not 'production'** - When running locally
2. **DEV_MODE environment variable is 'true'** - Can be explicitly enabled in production for testing

When development mode is active:
- ✅ API key generation works without Enterprise plan
- ✅ API key regeneration works without Enterprise plan  
- ✅ API authentication bypasses Enterprise plan check
- ⚠️ A warning banner appears in the dashboard

## Using Development Mode

### For Local Development

1. **Start your server locally:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Access the dashboard:**
   - Open `http://localhost:3000/dashboard`
   - Go to **Settings → API Access**
   - You'll see a blue banner indicating "Development Mode"
   - Click **"Generate API Key"** (no Enterprise plan needed)

3. **Use the API key in your mobile app:**
   - Open the mobile app
   - Enter API Base URL: `http://localhost:3000`
   - Enter your generated API key
   - Click "Connect"

### For Production Testing

If you need to enable dev mode in production (for testing only):

```bash
# Set environment variable
export DEV_MODE=true

# Or in Heroku
heroku config:set DEV_MODE=true
```

⚠️ **Warning:** Only enable `DEV_MODE=true` in production for temporary testing. Remove it after testing.

## API Key Format

API keys follow this format:
```
vs_live_<32 character hex string>
```

Example:
```
vs_live_abc123def456789012345678901234
```

## API Base URLs

- **Local Development:** `http://localhost:3000`
- **Production (Heroku):** `https://verishelf-e0b90033152c.herokuapp.com`
- **Production (Custom Domain):** `https://api.verishelf.com`

## Security Notes

1. **Development mode is for testing only** - Don't use dev mode API keys in production integrations
2. **API keys are still secure** - They still require proper authentication
3. **Enterprise plan required in production** - Production deployments should always require Enterprise plan
4. **Monitor API usage** - Check API key usage in the dashboard

## Troubleshooting

### "API key generation requires Enterprise plan"

**Solution:** Make sure you're running in development mode:
- Check `NODE_ENV` is not set to `'production'`
- Or set `DEV_MODE=true` environment variable
- Restart your server

### "Invalid or disabled API key"

**Solution:**
- Check that the API key is enabled in the dashboard
- Verify you're using the correct API Base URL
- Make sure the API key hasn't been regenerated (old keys become invalid)

### API requests failing in mobile app

**Solution:**
- Verify the API Base URL matches your server
- Check that development mode is enabled on the server
- Ensure the API key was generated in the same environment (local vs production)

## Example: Full Development Setup

```bash
# Terminal 1: Start backend server
cd /path/to/VeriShelf
npm start
# Server runs on http://localhost:3000

# Terminal 2: Start mobile app
cd my-app
npm start
# Scan QR code with Expo Go app

# In mobile app:
# - API Base URL: http://localhost:3000
# - API Key: vs_live_... (generated from dashboard)
```

## Production Deployment

When deploying to production:

1. **Remove DEV_MODE:**
   ```bash
   heroku config:unset DEV_MODE
   ```

2. **Set NODE_ENV:**
   ```bash
   heroku config:set NODE_ENV=production
   ```

3. **Verify Enterprise requirement:**
   - API key generation should now require Enterprise plan
   - Test that non-Enterprise users cannot generate keys

## Support

For issues or questions about development mode:
- Check server logs for errors
- Verify environment variables are set correctly
- Ensure database migrations are up to date
