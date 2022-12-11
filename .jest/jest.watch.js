module.exports = {
  watchPlugins: [
    'jest-watch-suspend',
    'jest-watch-repeat',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-toggle-config-2', { 'setting': 'verbose' }
    ],
    [
      'jest-watch-toggle-config-2', { 'setting': 'collectCoverage' }
    ]
  ]
}
