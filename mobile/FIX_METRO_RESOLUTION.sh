#!/bin/bash

# Fix Metro module resolution issues
echo "🔧 Fixing Metro module resolution..."

# Step 1: Clear all Metro caches
echo "🧹 Clearing Metro caches..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null

# Step 2: Clear Expo caches
echo "🧹 Clearing Expo caches..."
rm -rf .expo 2>/dev/null
rm -rf .expo-shared 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Step 3: Clear watchman
if command -v watchman &> /dev/null; then
    echo "🔄 Clearing watchman..."
    watchman watch-del-all 2>/dev/null
    watchman shutdown-server 2>/dev/null
    sleep 2
fi

# Step 4: Verify expo-asset is installed correctly
echo "✅ Verifying expo-asset installation..."
if [ -f "node_modules/expo-asset/build/index.js" ]; then
    echo "   ✓ expo-asset build files exist"
else
    echo "   ⚠ expo-asset build files missing, reinstalling..."
    rm -rf node_modules/expo-asset
    npx expo install expo-asset
fi

# Step 5: Reinstall if needed
echo "📦 Verifying all Expo packages..."
npx expo install --fix --check

echo ""
echo "✅ Fix complete!"
echo ""
echo "Now start with: npm start -- --reset-cache"
echo ""
