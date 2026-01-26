#!/bin/bash

# Quick fix script for EMFILE errors
# Run this before starting the app if you're still having issues

echo "🔧 Applying EMFILE fixes..."

# 1. Set file descriptor limit
ulimit -n 8192 2>/dev/null || ulimit -n 4096
echo "✓ File limit: $(ulimit -n)"

# 2. Restart watchman
if command -v watchman &> /dev/null; then
    echo "✓ Restarting watchman..."
    watchman shutdown-server 2>/dev/null
    watchman watch-del-all 2>/dev/null
    sleep 2
    echo "✓ Watchman restarted"
else
    echo "⚠ Watchman not installed. Install with: brew install watchman"
fi

# 3. Clear caches
echo "✓ Clearing caches..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# 4. Kill any existing Metro processes
echo "✓ Cleaning up Metro processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

echo ""
echo "✅ Fixes applied! Now run: npm start"
echo ""
