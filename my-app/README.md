# VeriShelf Mobile App

React Native mobile app for VeriShelf retail compliance platform, built with Expo Router.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the app:**
   ```bash
   npx expo start
   ```

3. **Get an API Key:**
   - For local development: See [DEV_MODE_API_KEYS.md](./DEV_MODE_API_KEYS.md)
   - For production: Requires Enterprise plan (Settings → API Access in dashboard)

4. **Login:**
   - Open the app
   - Enter API Base URL (e.g., `http://localhost:3000` for local)
   - Enter your API key
   - Click "Connect"

## Development Mode

This app supports **development mode** which allows API key generation without Enterprise plan:

- ✅ Works automatically when backend runs locally (`NODE_ENV !== 'production'`)
- ✅ Can be enabled in production with `DEV_MODE=true` environment variable
- 📖 See [DEV_MODE_API_KEYS.md](./DEV_MODE_API_KEYS.md) for details

## API Configuration

### Local Development
- **API Base URL:** `http://localhost:3000`
- Generate API key from `http://localhost:3000/dashboard` → Settings → API Access

### Production
- **API Base URL:** `https://verishelf-e0b90033152c.herokuapp.com`
- Or: `https://api.verishelf.com` (if DNS configured)
- Requires Enterprise plan subscription

## Features

- 📊 Dashboard with inventory stats
- 📦 Inventory management
- 📷 Barcode scanning
- ➕ Add/edit items
- ⚙️ Settings and API configuration

## Documentation

- [DEV_MODE_API_KEYS.md](./DEV_MODE_API_KEYS.md) - Development mode guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [README_VERISHELF.md](./README_VERISHELF.md) - Detailed documentation

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
