// Karma configuration
// Generated on Sun Dec 29 2019 16:07:24 GMT-0800 (Pacific Standard Time)
// const webpack = require('webpack')

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],
    // frameworks: ['jasmine', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      'src/browser/**/*.ts',
      'src/utils/**/!(*.spec).ts',
    ],

    // list of files / patterns to exclude
    exclude: [

    ],

    // plugins: ['karma-webpack', 'karma-jasmine', 'karma-chrome-launcher'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.ts': 'webpack',
      // 'src/**/*.ts': 'babel',
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
    webpack: {
      // externals: {
      //   '@mocktomata/io-local': 'empty'
      // },
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.browser.json',
              transpileOnly: true
            }
          }
          // Handle .ts and .tsx file via ts-loader.
          // {
          //   test: /\.tsx?$/,
          //   exclude: /node_modules/,
          //   use: {
          //     loader: 'babel-loader',
          //     options: {
          //       presets: [
          //         '@babel/env',
          //         ['@babel/typescript', { allowNamespaces: true }]
          //       ],
          //       // presets: [['@babel/typescript', { jsxPragma: 'h' }]],
          //       plugins: [
          //         '@babel/plugin-proposal-optional-chaining',
          //         '@babel/plugin-proposal-nullish-coalescing-operator',
          //         // ['@babel/plugin-proposal-function-bind'],
          //         // ['@babel/proposal-class-properties',
          //         //  {
          //         //    'loose': false
          //         //  }
          //         // ],
          //         // ['@babel/proposal-object-rest-spread'],
          //         // ['@babel/plugin-syntax-dynamic-import'],
          //         // ['@babel/transform-react-jsx', { 'pragma': 'h' }]
          //       ]
          //     }
          //   }
          // }
        ]
      },
      node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        module: 'empty'
      },
      // plugins: [
        // new webpack.IgnorePlugin(/fs/),
        // new webpack.IgnorePlugin(/module/),
        // new webpack.IgnorePlugin(/perf_hooks/)
      // ],
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        mainFields: ['browser', 'main']
      },
    }
    // babelPreprocessor: {
    //   options: {
    //     presets: [
    //       '@babel/preset-env',
    //       '@babel/preset-typescript'
    //     ],
    //     sourceMap: 'inline'
    //   }
    // }
    // karmaTypescriptConfig: {
    //   acronOptions: { ecmaVersion: 8 },
    //   bundlerOptions: {
    //     transforms: [require('karma-typescript-es6-transform')({
    //       plugins: [
    //         '@babel/plugin-proposal-object-rest-spread'
    //       ]
    //     })],
    //   },
    //   // exclude: ['./node_modules'],
    //   // compilerOptions: {
    //   //   module: 'commonjs'
    //   // },
    //   tsconfig: './tsconfig.browser.json'
    // }
  })
}
