#!/bin/bash

# Clear all caches for Metro/Expo
echo "🧹 Clearing all caches..."

# Clear Metro cache
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null

# Clear Expo cache
rm -rf .expo 2>/dev/null
rm -rf .expo-shared 2>/dev/null

# Clear node_modules cache
rm -rf node_modules/.cache 2>/dev/null

# Clear watchman
if command -v watchman &> /dev/null; then
    echo "🔄 Clearing watchman..."
    watchman watch-del-all 2>/dev/null
    watchman shutdown-server 2>/dev/null
fi

echo "✅ Caches cleared!"
echo ""
echo "Now run: npm start"
