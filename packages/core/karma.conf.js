const webpackConfig = require('./webpack.browser-test.config')
module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],
    // frameworks: ['mocha', 'karma-typescript'],
    // exclude: ['src/**/*.node-spec.ts'],
    // reporters: ['progress', 'karma-typescript'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    // browsers: ['ChromeHeadless'],
    // singleRun: true,
    autoRun: true,
    concurrency: Infinity,
    karmaTypescriptConfig: {
      bundlerOptions: {
        exclude: ['perf_hooks']
      },
      exclude: ['src/**/*.node-spec.ts'],
      tsconfig: './tsconfig.browser.json'
    },
    files: [
      'src/browser-test.ts'
      // 'src/*.ts',
      // 'src/**/*.ts'
    ],
    preprocessors: {
      // '**/*.ts': 'karma-typescript',
      'src/browser-test.ts': ['webpack']
      // 'src/*.spec.ts': ['webpack'],
      // 'src/**/*.spec.ts': ['webpack'],
      // 'src/*.browser-spec.ts': ['webpack'],
      // 'src/**/*.browser-spec.ts': ['webpack']
    },
    webpack: webpackConfig
  })
}
