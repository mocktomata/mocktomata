const projects = process.env.JEST_ENV ?
  [`<rootDir>/packages/*/jest.config${process.env.JEST_ENV === 'nodejs' ? '' : '.' + process.env.JEST_ENV}.js`] : [
    '<rootDir>/packages/*/jest.config.js',
    '<rootDir>/packages/*/jest.config.electron.js',
    '<rootDir>/packages/*/jest.config.jsdom.js'
  ]
module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s',
    '!<rootDir>/src/bin.[jt]s',
    '!<rootDir>/src/**/*.spec.*'
  ],
  coverageReporters: ['text', 'html'],
  projects,
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
