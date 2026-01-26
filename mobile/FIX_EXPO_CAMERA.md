# Fixing expo-camera Resolution Error

## Error
```
Unable to resolve "expo-camera" from "src/screens/ScannerScreen.js"
```

## Solution

The `expo-camera` package needs to be installed with the correct version for Expo SDK 54.

### Quick Fix

Run this command in the `mobile` directory:

```bash
npx expo install expo-camera
```

This will automatically install the correct version (`~17.0.10`) for SDK 54.

### Manual Installation

If you prefer to install manually:

```bash
npm install expo-camera@~17.0.10
```

### Using the Installation Script

The installation script now includes expo-camera:

```bash
npm run install:sdk54
```

### After Installing

1. **Clear cache:**
   ```bash
   npm run clear
   ```

2. **Restart the development server:**
   ```bash
   npm start
   ```

## Verify Installation

Check that `expo-camera` is in your `package.json`:

```json
"dependencies": {
  "expo-camera": "~17.0.10"
}
```

## Common Issues

### Still getting "Unable to resolve" after installation

1. **Clear all caches:**
   ```bash
   npm run clear
   rm -rf node_modules/.cache
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

3. **Restart Metro bundler:**
   ```bash
   npm start -- --reset-cache
   ```

### Version Mismatch

If you see version warnings, use Expo's install command:

```bash
npx expo install expo-camera
```

This ensures the version matches your SDK.
