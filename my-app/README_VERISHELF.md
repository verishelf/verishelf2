# VeriShelf Mobile App

React Native mobile application for VeriShelf retail compliance platform, built with Expo Router.

## Features

- 🔐 API Key Authentication
- 📦 Inventory Management
- 📷 Barcode Scanning
- 📊 Dashboard with Statistics
- 🔍 Search & Filter Items
- ➕ Add/Edit Items
- 📍 Location Management
- ⚠️ Expiry Date Tracking

## Project Structure

```
my-app/
├── app/
│   ├── _layout.tsx          # Root layout with auth routing
│   ├── login.tsx            # Login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Dashboard (Home)
│   │   └── explore.tsx      # Inventory list
│   ├── inventory.tsx        # Full inventory screen
│   ├── item/[id].tsx        # Item detail screen
│   ├── scanner.tsx          # Barcode scanner
│   ├── add-item.tsx         # Add new item
│   └── settings.tsx         # Settings screen
├── context/
│   └── AuthContext.tsx      # Authentication context
├── services/
│   └── api.ts               # VeriShelf API client
└── package.json
```

## Installation

1. **Install dependencies:**
   ```bash
   cd my-app
   npm install
   ```

2. **Install additional required packages:**
   ```bash
   npx expo install @react-native-async-storage/async-storage expo-camera expo-asset date-fns
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Configuration

### API Setup

1. Get your API key from VeriShelf dashboard:
   - Go to Settings → API Access
   - Generate an API key (requires Enterprise plan)

2. Enter your API credentials in the app:
   - API Base URL: `https://api.verishelf.com` (or your custom domain)
   - API Key: Your generated API key

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

## Navigation

The app uses Expo Router for file-based routing:

- `/login` - Login screen (shown when not authenticated)
- `/(tabs)` - Main app tabs
  - `/(tabs)/` - Dashboard
  - `/(tabs)/explore` - Inventory list
- `/inventory` - Full inventory screen
- `/item/[id]` - Item detail screen
- `/scanner` - Barcode scanner
- `/add-item` - Add new item
- `/settings` - Settings screen

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

## Troubleshooting

### Camera Permission Issues
- iOS: Check Info.plist for camera usage description
- Android: Ensure CAMERA permission is in AndroidManifest.xml

### API Connection Issues
- Verify API key is correct
- Check API base URL is accessible
- Ensure Enterprise plan subscription is active

## License

Proprietary - VeriShelf
