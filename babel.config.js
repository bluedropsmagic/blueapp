module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Build optimizations
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: false,
      }],
      // Remove console logs in production
      ...(process.env.NODE_ENV === 'production' ? [[
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ]] : []),
    ].filter(Boolean),
  };
};