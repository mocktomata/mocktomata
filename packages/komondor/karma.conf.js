module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/komondor.ts',
      'src/komondor.test.ts'
    ],
    preprocessors: {
      '**/*.ts': 'karma-typescript'
    },
    reporters: ['progress', 'karma-typescript'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    // singleRun: true,
    autoRun: true,
    concurrency: Infinity,
    karmaTypescriptConfig: {
      bundlerOptions: {
        exclude: ['perf_hooks']
      },
      tsconfig: './tsconfig.browser.json'
    }
  })
}
