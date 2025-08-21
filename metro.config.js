const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Build optimizations
config.transformer = {
  ...config.transformer,
  // Enable minification for faster builds
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    // Optimize for size and speed
    keep_fnames: false,
    mangle: {
      keep_fnames: false,
      toplevel: true,
    },
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
  },
};

// Resolver optimizations
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
  alias: {
    '@': './src',
    '@/sections': './src/sections',
    '@/shared': './src/shared',
  },
  // Enable tree shaking
  unstable_enablePackageExports: true,
};

// Performance optimizations
config.maxWorkers = 1; // Reduce for faster builds
config.resetCache = false;

// Cache optimizations
config.cacheStores = [
  {
    name: 'filesystem',
    path: './node_modules/.cache/metro',
  },
];

module.exports = config;