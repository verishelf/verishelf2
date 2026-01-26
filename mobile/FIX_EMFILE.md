# Fixing EMFILE: Too Many Open Files Error

This error occurs when the system runs out of file descriptors. Here are several solutions:

## Solution 1: Install Watchman (Recommended)

Watchman is a file watching service that's more efficient than Node's built-in file watcher:

```bash
# Install via Homebrew
brew install watchman

# Verify installation
watchman --version
```

After installing watchman, restart your development server:
```bash
npm start
```

## Solution 2: Increase File Descriptor Limit

### Temporary (Current Session Only)
```bash
ulimit -n 4096
npm start
```

### Permanent (macOS)
Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
ulimit -n 4096
```

Then restart your terminal or run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

## Solution 3: Use Metro Config (Already Added)

The `metro.config.js` file has been configured to reduce file watching. This should help prevent the issue.

## Solution 4: Clear Cache and Restart

Sometimes clearing the cache helps:
```bash
npm run start:reset
# or
expo start --clear
```

## Solution 5: Check for Too Many Files

If you have a very large `node_modules` directory, consider:
1. Removing `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Using `.watchmanconfig` to ignore large directories (already added)

## Quick Fix Command

### Option 1: Use the Quick Fix Script (Easiest)
```bash
cd mobile
./QUICK_FIX.sh
npm start
```

### Option 2: Manual Fix
Run this before starting the app:
```bash
ulimit -n 8192 && npm start
```

### Option 3: Use npm scripts
The startup script automatically applies fixes:
```bash
npm start
```

### Option 4: If still failing, try with watchman restart
```bash
watchman shutdown-server
watchman watch-del-all
ulimit -n 8192
npm start
```

## Verify Fix

Check your current limit:
```bash
ulimit -n
```

Should show at least 4096 (or higher).

## Still Having Issues?

1. **Install Watchman** (most reliable solution)
2. **Check for symlinks** - Sometimes symlinked directories cause issues
3. **Restart your computer** - Clears all open file handles
4. **Close other applications** - Free up system resources
