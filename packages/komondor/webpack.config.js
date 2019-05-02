'use strict';
const paramCase = require('param-case')
const pascalCase = require('pascal-case')
const path = require('path')
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const pjson = require('./package.json')

const filename = paramCase(pjson.name)
const globalVariable = pascalCase(filename)

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    'komondor': './src/komondor'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
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
    filename: '[name].js',
    library: globalVariable,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    mainFields: ['browser', 'main']
  },
  plugins: [
    // new UglifyJSPlugin({ sourceMap: true }),
    new webpack.IgnorePlugin(/fs/),
    new webpack.IgnorePlugin(/perf_hooks/)
  ]
}
