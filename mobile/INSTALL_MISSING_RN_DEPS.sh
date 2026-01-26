#!/bin/bash

# Install all missing React Native 0.81 dependencies
echo "📦 Installing React Native 0.81 dependencies..."

# Install required packages
npm install @react-native/virtualized-lists@^0.81.5 memoize-one@^6.0.0

# Verify installation
echo "✅ Verifying installation..."
if [ -d "node_modules/memoize-one" ]; then
    echo "   ✓ memoize-one installed"
else
    echo "   ✗ memoize-one missing"
fi

if [ -d "node_modules/@react-native/virtualized-lists" ]; then
    echo "   ✓ @react-native/virtualized-lists installed"
else
    echo "   ✗ @react-native/virtualized-lists missing"
fi

# Clear caches
echo "🧹 Clearing caches..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

echo ""
echo "✅ Installation complete!"
echo "Now run: npm start -- --reset-cache"
echo ""
