const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  projects: [
    '<rootDir>/packages/*'
  ],
  'watchPlugins': [
    ['jest-watch-exec', { 'on-start': 'yarn build', 'on-start-ignore-error': true }],
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
