# Fixing Missing Expo Dependencies

## Common Missing Dependencies

When upgrading to Expo SDK 54, some packages may be missing. Here are the common ones:

### Required Packages

1. **expo-asset** - Required for asset loading
   ```bash
   npm install expo-asset@~11.0.0
   ```

2. **babel-preset-expo** - Required for Babel configuration
   ```bash
   npm install babel-preset-expo@~12.0.0 --save-dev
   ```

### Quick Fix

Run the installation script which installs all required dependencies:

```bash
cd mobile
npm run install:sdk54
```

Or install manually:

```bash
cd mobile
npm install expo-asset@~11.0.0
npm install babel-preset-expo@~12.0.0 --save-dev
npx expo install --fix
```

### Using Expo Install (Recommended)

The best way to ensure all dependencies are correct is to use `expo install`:

```bash
npx expo install --fix
```

This will automatically install the correct versions of all Expo packages for SDK 54.

### After Installing

Clear cache and restart:

```bash
npm run clear
npm start
```

## Common Errors

### "Unable to resolve expo-asset"
- **Fix**: `npm install expo-asset@~11.0.0`

### "Cannot find module babel-preset-expo"
- **Fix**: `npm install babel-preset-expo@~12.0.0 --save-dev`

### "Unable to resolve expo-constants"
- **Fix**: `npx expo install expo-constants`

### General Solution

If you see "Unable to resolve" errors for any `expo-*` package:

```bash
npx expo install <package-name>
```

This ensures the correct version for your SDK is installed.
