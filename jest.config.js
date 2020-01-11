module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s',
    '!<rootDir>/src/bin.[jt]s',
    '!<rootDir>/src/**/*.spec.*'
  ],
  projects: [
    '<rootDir>/packages/*',
    // not running right now because we use karma
    // jsdom still different compare to browser,
    // e.g. getCallerRelativePath does not work correctly.
    // tests on browser should be very limited.
    // most logic should be shared and use jest to test.
    '<rootDir>/packages/mocktomata/jest.config.electron.js',
    '<rootDir>/packages/mocktomata/jest.config.jsdom.js'
  ],
  reporters: [
    'default',
    'jest-progress-tracker',
    ['jest-audio-reporter', { volume: 0.3 }],
  ],
  watchPlugins: [
    'jest-watch-suspend',
    'jest-watch-repeat',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-toggle-config', { 'setting': 'verbose' }
    ],
    [
      'jest-watch-toggle-config', { 'setting': 'collectCoverage' }
    ]
  ]
}
