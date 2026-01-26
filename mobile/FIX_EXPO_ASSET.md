# Fixing "Unable to resolve expo-asset" Error

## The Problem

Even though `expo-asset` is in your `package.json` and `node_modules`, Metro bundler can't resolve it. This is usually a cache issue.

## Solution

### Step 1: Clear All Caches

Run this command in the `mobile` directory:

```bash
cd mobile
npm run clear
```

Or manually:

```bash
./CLEAR_CACHE.sh
```

### Step 2: Verify Package is Installed

Check that expo-asset is in package.json:

```bash
grep "expo-asset" package.json
```

Should show: `"expo-asset": "~12.0.12"`

### Step 3: Reinstall if Needed

If clearing cache doesn't work, reinstall:

```bash
npm install expo-asset@~12.0.12
```

Or use Expo's install command (recommended):

```bash
npx expo install expo-asset
```

### Step 4: Restart with Clean Cache

```bash
npm start -- --reset-cache
```

Or:

```bash
npm run start:reset
```

## Alternative: Use Expo Install (Best Practice)

The best way to ensure all Expo packages are correctly installed:

```bash
cd mobile
npx expo install --fix
```

This will:
- Install all missing Expo packages
- Fix version mismatches
- Ensure compatibility with SDK 54

Then restart:

```bash
npm run clear
npm start
```

## If Still Failing

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

2. **Check for version conflicts:**
   ```bash
   npx expo-doctor
   ```

3. **Restart watchman:**
   ```bash
   watchman shutdown-server
   npm start
   ```
