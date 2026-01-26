// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Aggressively reduce file watching to prevent EMFILE errors
config.watchFolders = [__dirname];

// Block watching node_modules entirely - Metro will still resolve them but won't watch
// Note: blockList prevents watching, not resolution
config.resolver = {
  ...config.resolver,
  blockList: [
    // Block watching nested node_modules (but allow top-level resolution)
    /node_modules\/.*\/node_modules\/.*/,
    // Block other common large directories from being watched
    /\.git\/.*/,
    /\.expo\/.*/,
    /dist\/.*/,
    // Don't block build directories - needed for expo-asset and other packages
  ],
  // Only watch source files
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs', 'cjs'],
  // Enable unstable_allowRequireContext for better module resolution
  unstable_enablePackageExports: true,
  // Add node_modules resolution paths
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
};

// Use watchman if available, otherwise use polling with longer intervals
config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: true,
    interval: 10000, // Check every 10 seconds
  },
  // Use watchman if available, fallback to polling
  watchman: true,
  // Polling fallback (slower but uses fewer file handles)
  usePolling: false,
  interval: 1000,
  binaryInterval: 1000,
};

// Reduce the number of workers
config.maxWorkers = 2;

module.exports = config;
