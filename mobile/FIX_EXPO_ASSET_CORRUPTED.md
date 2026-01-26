# Fixing Corrupted expo-asset Package

## Error
```
The package expo-asset contains an invalid package.json configuration.
The resolution defined in "exports" is build/index.js, however this file does not exist.
```

## Solution

The `expo-asset` package is corrupted or incompletely installed. Follow these steps:

### Step 1: Remove and Reinstall

```bash
cd mobile
rm -rf node_modules/expo-asset
npm install expo-asset@~12.0.12
```

### Step 2: Use Expo Install (Recommended)

Expo's install command ensures correct installation:

```bash
cd mobile
npx expo install expo-asset
```

### Step 3: Full Clean Reinstall

If the above doesn't work:

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

### Step 4: Clear Cache and Restart

After reinstalling:

```bash
npm run clear
npm start -- --reset-cache
```

## Why This Happens

This usually occurs when:
- Package installation was interrupted
- Version mismatch between package.json and installed version
- Corrupted node_modules
- Incomplete npm install

## Prevention

Always use `npx expo install <package>` for Expo packages instead of `npm install` to ensure correct versions and proper installation.
