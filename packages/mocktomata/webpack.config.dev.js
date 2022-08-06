const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/index',
  mode: 'development',
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: ['source-map-loader'],
      //   enforce: 'pre'
      // },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.browser.json',
          transpileOnly: true
        }
      }
    ]
  },
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    mainFields: ['browser', 'main']
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /fs/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /module/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /perf_hooks/ })
  ]
}
