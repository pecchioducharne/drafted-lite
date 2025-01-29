const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "path": require.resolve("path-browserify"),
          "timers": require.resolve("timers-browserify"),
          "stream": require.resolve("stream-browserify"),
          "util": require.resolve("util/"),
          "buffer": require.resolve("buffer/"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "url": require.resolve("url/"),
          "zlib": require.resolve("browserify-zlib")
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      ]
    }
  }
}; 