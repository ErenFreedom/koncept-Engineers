const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
        util: require.resolve("util/"),
        process: require.resolve("process/browser"),
      };
      return webpackConfig;
    },
  },
  plugins: [], // Ensure this is an empty array if no plugins are needed
};
