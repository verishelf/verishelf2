# Fix Heroku package-lock.json Error

## The Problem
Heroku uses `npm ci` which is strict and requires the lock file to include all optional dependencies for all platforms. Since the lock file was generated on macOS, it doesn't include Linux-specific optional dependencies that Heroku needs.

## Solution: Set Heroku Environment Variable

You need to tell Heroku to use `npm install` instead of `npm ci`. Do this:

### Option 1: Via Heroku Dashboard (Easiest)
1. Go to https://dashboard.heroku.com/apps/verishelf/settings
2. Click "Reveal Config Vars"
3. Add a new config var:
   - **Key**: `NPM_CONFIG_PRODUCTION`
   - **Value**: `false`
4. Or add:
   - **Key**: `USE_NPM_INSTALL`
   - **Value**: `true`

### Option 2: Via Heroku CLI
```bash
heroku config:set USE_NPM_INSTALL=true -a verishelf
```

### Option 3: Use a Custom Buildpack
Actually, the best solution is to use a buildpack that handles this. But first, try setting the environment variable above.

## Alternative: Regenerate Lock File on Linux

If the environment variable doesn't work, you can:
1. Use a Linux VM or Docker container
2. Run `npm install` there to generate a lock file with Linux dependencies
3. Commit and push that lock file

## What I've Done
- ✅ Added `.npmrc` file
- ✅ Updated `package-lock.json`
- ✅ Committed and pushed changes

## Next Steps
1. Set the environment variable in Heroku (see above)
2. Trigger a new deployment (or it will auto-deploy from the push)
3. Check if it builds successfully

