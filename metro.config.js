const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('sql');

// Web-specific optimizations
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native$': 'react-native-web',
  };
}

// Fix memory issues with transformer
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Reduce memory usage
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Increase memory limits for Metro
config.maxWorkers = 2;

module.exports = config;