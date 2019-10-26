const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  displayName: 'mocktomata',
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
