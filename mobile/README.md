# VeriShelf Mobile App

React Native mobile application for VeriShelf retail compliance platform.

## Features

- 🔐 API Key Authentication
- 📦 Inventory Management
- 📷 Barcode Scanning
- 📊 Dashboard with Statistics
- 🔍 Search & Filter Items
- ➕ Add/Edit Items
- 📍 Location Management
- ⚠️ Expiry Date Tracking

## Prerequisites

- Node.js (>=20.19.0) - Required for Expo SDK 54
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (for iOS) or Android Studio (for Android)
- Latest Expo Go app on your device (for SDK 54 compatibility)

## Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Running on Device/Simulator

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (for testing)
```bash
npm run web
```

## Configuration

### API Setup

1. Get your API key from VeriShelf dashboard:
   - Go to Settings → API Access
   - Generate an API key (requires Enterprise plan)

2. Enter your API credentials in the app:
   - API Base URL: `https://api.verishelf.com` (or your custom domain)
   - API Key: Your generated API key

## Project Structure

```
mobile/
├── App.js                 # Main app entry point
├── src/
│   ├── context/
│   │   └── AuthContext.js # Authentication context
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── InventoryScreen.js
│   │   ├── ItemDetailScreen.js
│   │   ├── ScannerScreen.js
│   │   ├── AddItemScreen.js
│   │   └── SettingsScreen.js
│   └── services/
│       └── api.js         # API client
└── package.json
```

## API Integration

The app uses the VeriShelf Enterprise API. All API calls are authenticated using Bearer token authentication.

### Available Endpoints

- `GET /api/v1/items` - List items
- `GET /api/v1/items/:id` - Get item details
- `POST /api/v1/items` - Create item
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `GET /api/v1/locations` - List locations
- `GET /api/v1/stats` - Get statistics

See `website/api-docs.html` for complete API documentation.

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### EMFILE: Too Many Open Files Error

If you see `Error: EMFILE: too many open files`, try:

1. **Use the startup script** (recommended):
   ```bash
   npm start
   ```
   This automatically sets the file limit.

2. **Install/restart Watchman**:
   ```bash
   brew install watchman
   watchman shutdown-server
   ```

3. **Clear cache and restart**:
   ```bash
   npm run start:reset
   ```

4. **Manual fix**:
   ```bash
   ulimit -n 4096
   npm start
   ```

See `FIX_EMFILE.md` for detailed solutions.

### Camera Permission Issues
- iOS: Check Info.plist for camera usage description
- Android: Ensure CAMERA permission is in AndroidManifest.xml

### API Connection Issues
- Verify API key is correct
- Check API base URL is accessible
- Ensure Enterprise plan subscription is active

## License

Proprietary - VeriShelf
