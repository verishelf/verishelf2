#!/bin/bash

# Installation script for Expo SDK 54 upgrade
# Run this after updating package.json

echo "🚀 Installing Expo SDK 54 dependencies..."
echo ""

# Step 1: Remove old dependencies
echo "📦 Removing old node_modules and lock file..."
rm -rf node_modules package-lock.json

# Step 2: Install new dependencies
echo "📥 Installing dependencies..."
npm install

# Step 3: Install required Expo packages
echo "📦 Installing required Expo packages..."
npm install babel-preset-expo@~54.0.10 --save-dev
npm install expo-asset@~12.0.12
npm install expo-camera@~17.0.10

# Step 4: Fix any version mismatches
echo "🔧 Fixing dependency versions..."
npx expo install --fix

# Step 5: Check for issues
echo "🏥 Running Expo Doctor..."
npx expo-doctor

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Review any warnings from expo-doctor"
echo "2. Clear cache: npm run start:reset"
echo "3. Start the app: npm start"
echo ""
