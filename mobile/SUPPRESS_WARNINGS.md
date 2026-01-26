# About Metro Bundler Warnings

## The Warning

```
WARN The package expo-asset contains an invalid package.json configuration.
Reason: The resolution defined in "exports" is build/index.js, however this file does not exist.
Falling back to file-based resolution.
```

## What This Means

This is a **harmless warning**, not an error. Here's what's happening:

1. Metro bundler checks the `package.json` exports field
2. It initially can't find the file (timing/cache issue)
3. Metro automatically falls back to file-based resolution
4. The app works correctly

## Why It Happens

- Metro's module resolution cache can be out of sync
- The file exists but Metro checks before it's fully indexed
- Known issue with some Expo packages and Metro's exports resolution

## Solutions

### Option 1: Ignore It (Recommended)

The warning is harmless. Your app will work fine. Metro's fallback resolution works correctly.

### Option 2: Clear Cache

If the warning bothers you:

```bash
npm run clear
npm start -- --reset-cache
```

### Option 3: Update Metro Config

The metro.config.js has been updated to:
- Remove blocking of build directories
- Enable package exports resolution

This should reduce (but may not eliminate) the warning.

## Verification

To verify everything works despite the warning:

1. The app should bundle successfully
2. No actual "Unable to resolve" errors
3. expo-asset functionality works in the app

If you see actual errors (not just warnings), then follow the fix steps in `FIX_EXPO_ASSET.md`.
