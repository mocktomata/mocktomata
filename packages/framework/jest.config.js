const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  'globals': {
    'ts-jest': {
      'diagnostics': false,
      'tsConfig': {
        'module': 'esnext',
        'target': 'esnext',
      }
    }
  },
  displayName: 'framework',
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
