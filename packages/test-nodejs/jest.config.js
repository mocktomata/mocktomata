const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  displayName: 'test-nodejs',
  moduleNameMapper: {
    '@mocktomata/(.*)': '<rootDir>/../$1/src',
    'mocktomata': '<rootDir>/../mocktomata/src'
  }
}
