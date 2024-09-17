const raf = require('raf');
raf.polyfill();

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const sentryConfig = getSentryExpoConfig(__dirname);
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

module.exports = {
  ...sentryConfig,
  ...config,
  resolver: {
    ...config.resolver,
    blockList: [config.resolver.blockList, /\/amplify\/.*$/],
    sourceExts: [...config.resolver.sourceExts, "mjs"],
  },
};

