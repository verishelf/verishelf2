# Fixing Missing React Native 0.81 Dependencies

## Common Missing Dependencies

React Native 0.81.5 requires several peer dependencies that must be installed separately:

### Required Packages

1. **@react-native/virtualized-lists** - For FlatList and VirtualizedList components
2. **memoize-one** - Used by React Native's list components

## Quick Fix

Install all missing dependencies:

```bash
cd mobile
npm install @react-native/virtualized-lists@^0.81.5 memoize-one@^6.0.0
```

Or use the installation script:

```bash
npm run install:all
```

## After Installing

Clear cache and restart:

```bash
npm run clear
npm start -- --reset-cache
```

## Why These Are Needed

React Native 0.81+ modularized several components into separate packages for:
- Better tree-shaking
- Smaller bundle sizes
- Independent versioning

These packages are peer dependencies, meaning they must be explicitly installed.

## Full List of React Native 0.81 Dependencies

If you encounter more missing dependencies, check React Native 0.81 requirements:

```bash
npx expo install --fix
```

This will install all required peer dependencies for your React Native version.

## Verification

After installing, verify in package.json:

```json
"dependencies": {
  "@react-native/virtualized-lists": "^0.81.5",
  "memoize-one": "^6.0.0"
}
```
