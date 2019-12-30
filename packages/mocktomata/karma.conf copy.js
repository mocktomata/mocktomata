module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/browser/**/*.ts',
    ],
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },
    reporters: ['progress', 'karma-typescript'],
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
      transforms: [require('karma-typescript-es6-transform')()],
      tsconfig: './tsconfig.browser.json'
    }
  })
}
