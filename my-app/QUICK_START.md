# VeriShelf Mobile App - Quick Start

## Setup

1. **Install dependencies:**
   ```bash
   cd my-app
   npm install
   ```

2. **Install required Expo packages:**
   ```bash
   npx expo install @react-native-async-storage/async-storage expo-camera expo-asset date-fns
   ```

3. **Start the app:**
   ```bash
   npm start
   ```

## First Run

1. The app will show the login screen
2. Enter your API credentials:
   - **API Base URL**: `https://api.verishelf.com` (or your custom domain)
   - **API Key**: Your VeriShelf API key (from dashboard: Settings → API Access)

3. After successful login, you'll see the dashboard

## Features

- **Dashboard**: View statistics and quick actions
- **Inventory**: Browse and search all items
- **Scanner**: Scan barcodes to find or create items
- **Add Item**: Manually add new inventory items
- **Settings**: View API configuration and logout

## Navigation

- Use the bottom tabs to switch between Dashboard and Inventory
- Tap items to view details
- Use the action buttons on the dashboard for quick access

## Troubleshooting

### "Unable to resolve" errors
Run:
```bash
npx expo install --fix
npm start -- --reset-cache
```

### Camera not working
- Ensure camera permissions are granted
- Check that `expo-camera` is installed

### API connection fails
- Verify your API key is correct
- Check that you have an Enterprise plan
- Ensure the API base URL is correct
