# Fixing "@react-native/virtualized-lists" Error

## Error
```
Unable to resolve "@react-native/virtualized-lists" from "node_modules/react-native/Libraries/Lists/FlatList.js"
```

## Solution

React Native 0.81.5 requires `@react-native/virtualized-lists` as a peer dependency. Install it:

### Quick Fix

```bash
cd mobile
npm install @react-native/virtualized-lists@^0.81.5
```

### Or Use Expo Install (Recommended)

```bash
cd mobile
npx expo install @react-native/virtualized-lists
```

This ensures the correct version for your React Native version.

### After Installing

Clear cache and restart:

```bash
npm run clear
npm start -- --reset-cache
```

## Why This Happens

React Native 0.81+ split `VirtualizedList` into a separate package (`@react-native/virtualized-lists`) for better modularity. This package must be installed alongside React Native.

## Verify Installation

Check that it's in your `package.json`:

```json
"dependencies": {
  "@react-native/virtualized-lists": "^0.81.5"
}
```

## Full Reinstall (If Needed)

If you continue having issues:

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npm start -- --reset-cache
```
