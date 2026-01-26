# Fixing Babel Preset Error

## Error
```
Error: Cannot find module 'babel-preset-expo'
```

## Solution

The `babel-preset-expo` package is missing from your `devDependencies`. 

### Quick Fix

Run this command in the `mobile` directory:

```bash
npm install babel-preset-expo@~12.0.0 --save-dev
```

### Or use the installation script

```bash
npm run install:sdk54
```

This will install all required dependencies including `babel-preset-expo`.

### Verify

After installing, check that `babel-preset-expo` is in your `package.json`:

```json
"devDependencies": {
  "@babel/core": "^7.20.0",
  "babel-preset-expo": "~12.0.0"
}
```

And verify your `babel.config.js` includes it:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

### After Installing

Clear cache and restart:

```bash
npm run clear
npm start
```
