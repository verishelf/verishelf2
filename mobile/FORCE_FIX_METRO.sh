#!/bin/bash

# Aggressive Metro cache and resolution fix
echo "🔧 Force fixing Metro module resolution..."

# Step 1: Kill all Metro/Node processes
echo "🛑 Stopping all Metro processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "node.*metro" 2>/dev/null || true
sleep 2

# Step 2: Remove and reinstall memoize-one
echo "📦 Reinstalling memoize-one..."
rm -rf node_modules/memoize-one
npm install memoize-one@^6.0.0 --force

# Step 3: Reinstall @react-native/virtualized-lists
echo "📦 Reinstalling @react-native/virtualized-lists..."
rm -rf node_modules/@react-native/virtualized-lists
npm install @react-native/virtualized-lists@^0.81.5 --force

# Step 4: Clear ALL caches
echo "🧹 Clearing all caches..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf .expo-shared 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .metro 2>/dev/null

# Step 5: Clear watchman
if command -v watchman &> /dev/null; then
    echo "🔄 Clearing watchman..."
    watchman watch-del-all 2>/dev/null
    watchman shutdown-server 2>/dev/null
    sleep 2
fi

# Step 6: Verify packages
echo "✅ Verifying packages..."
if [ -f "node_modules/memoize-one/package.json" ]; then
    echo "   ✓ memoize-one installed"
else
    echo "   ✗ memoize-one MISSING - installing..."
    npm install memoize-one@^6.0.0
fi

if [ -f "node_modules/@react-native/virtualized-lists/package.json" ]; then
    echo "   ✓ @react-native/virtualized-lists installed"
else
    echo "   ✗ @react-native/virtualized-lists MISSING - installing..."
    npm install @react-native/virtualized-lists@^0.81.5
fi

echo ""
echo "✅ Force fix complete!"
echo ""
echo "Now run: npm start -- --reset-cache"
echo "If still failing, try: rm -rf node_modules && npm install"
echo ""
