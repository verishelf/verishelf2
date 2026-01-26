# VeriShelf Mobile App Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Create required assets:**
   
   You'll need to create these image files in the `mobile/assets/` directory:
   - `icon.png` (1024x1024) - App icon
   - `splash.png` (1242x2436) - Splash screen
   - `adaptive-icon.png` (1024x1024) - Android adaptive icon
   - `favicon.png` (48x48) - Web favicon

   For now, you can use placeholder images or generate them using:
   - [App Icon Generator](https://www.appicon.co/)
   - [Expo Asset Generator](https://docs.expo.dev/guides/app-icons/)

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## API Configuration

Before using the app, you need:

1. **VeriShelf Enterprise Plan** - API access requires Enterprise subscription
2. **API Key** - Generate from dashboard: Settings → API Access
3. **API Base URL** - Usually `https://api.verishelf.com` or your custom domain

## Development

### Using Expo Go (Recommended for Development)

1. Install Expo Go app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the dev server and scan the QR code

### Using Simulators/Emulators

**iOS Simulator (macOS only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

## Troubleshooting

### "Camera permission denied"
- iOS: Check that camera permission is requested in app.json
- Android: Ensure CAMERA permission is in AndroidManifest (handled by Expo)

### "API request failed"
- Verify your API key is correct
- Check API base URL is accessible
- Ensure Enterprise plan is active

### "Module not found"
- Run `npm install` again
- Clear Expo cache: `expo start -c`

## Building for Production

### iOS
```bash
expo build:ios
```
Requires Apple Developer account and certificates.

### Android
```bash
expo build:android
```
Requires Google Play Developer account.

## Project Structure

```
mobile/
├── App.js                    # Main entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── assets/                   # Images, fonts, etc.
│   ├── icon.png
│   ├── splash.png
│   └── ...
└── src/
    ├── context/
    │   └── AuthContext.js    # Authentication state
    ├── screens/              # App screens
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── InventoryScreen.js
    │   ├── ItemDetailScreen.js
    │   ├── ScannerScreen.js
    │   ├── AddItemScreen.js
    │   └── SettingsScreen.js
    └── services/
        └── api.js            # API client
```

## Next Steps

1. Create the required asset images
2. Test API connection with your VeriShelf account
3. Customize branding/colors if needed
4. Add additional features as needed
