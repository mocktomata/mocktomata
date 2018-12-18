'use strict';
const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    main: './src/index.ts',
    test: './src/browser-test.ts',
    plugins: [
      'komondor-plugin-fixture-deep-link/pluginA',
      'komondor-plugin-fixture-dummy',
      'komondor-plugin-fixture-no-activate'
    ]
  },
  mode: 'development',
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.tsx?$/,
        options: {
          configFile: 'tsconfig.browser.json',
          transpileOnly: true
        }
      }
    ]
  },
  node: {
    fs: 'empty',
    perf_hooks: 'empty'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve('browser-test-out'),
    filename: `[name].js`
  }
}
