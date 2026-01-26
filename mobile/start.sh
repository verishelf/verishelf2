#!/bin/bash

# VeriShelf Mobile App Startup Script
# Fixes EMFILE errors and ensures proper environment

# Increase file descriptor limit (try higher value first, fallback to 4096)
ulimit -n 8192 2>/dev/null || ulimit -n 4096

echo "File descriptor limit set to: $(ulimit -n)"

# Check if watchman is installed and running
if command -v watchman &> /dev/null; then
    echo "✓ Watchman is installed ($(watchman --version 2>/dev/null || echo 'unknown version'))"
    # Restart watchman to clear any issues
    echo "Restarting watchman..."
    watchman shutdown-server 2>/dev/null || true
    sleep 1
    # Clear watchman state
    watchman watch-del-all 2>/dev/null || true
else
    echo "⚠ Watchman not found. Installing watchman is highly recommended:"
    echo "   brew install watchman"
    echo ""
    echo "Continuing without watchman (may be slower and use more resources)..."
fi

# Clear Metro cache if requested
if [ "$1" == "--clear" ]; then
    echo "Clearing Metro cache..."
    rm -rf $TMPDIR/metro-* 2>/dev/null || true
    rm -rf $TMPDIR/haste-* 2>/dev/null || true
    rm -rf .expo 2>/dev/null || true
    shift # Remove --clear from arguments
fi

# Set environment variable to use watchman
export EXPO_USE_WATCHMAN=true

# Start Expo
echo "Starting Expo..."
echo "If you still see EMFILE errors, try:"
echo "  1. Install watchman: brew install watchman"
echo "  2. Restart your terminal"
echo "  3. Close other applications using many files"
echo ""
exec expo start "$@"
