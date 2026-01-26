#!/bin/bash

# Complete dependency installation script for Expo SDK 54
echo "🚀 Installing all required dependencies for Expo SDK 54..."
echo ""

# Step 1: Install all packages
echo "📦 Installing packages from package.json..."
npm install

# Step 2: Use Expo install to fix versions
echo "🔧 Fixing Expo package versions..."
npx expo install --fix

# Step 3: Remove and reinstall expo-asset (fix corrupted package)
echo "🔧 Fixing expo-asset package..."
rm -rf node_modules/expo-asset 2>/dev/null

# Step 4: Install React Native dependencies
echo "📥 Installing React Native dependencies..."
npm install @react-native/virtualized-lists@^0.81.5 memoize-one@^6.0.0

# Step 5: Install specific required packages
echo "📥 Installing required Expo packages..."
npx expo install expo-asset expo-font expo-camera expo-status-bar

# Step 5: Install Babel preset
echo "📦 Installing Babel preset..."
npm install babel-preset-expo@~54.0.10 --save-dev

# Step 6: Clear all caches
echo "🧹 Clearing caches..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf .expo-shared 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Step 8: Restart watchman
if command -v watchman &> /dev/null; then
    echo "🔄 Restarting watchman..."
    watchman watch-del-all 2>/dev/null
    watchman shutdown-server 2>/dev/null
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm start -- --reset-cache"
echo "2. Or: npm run start:reset"
echo ""
