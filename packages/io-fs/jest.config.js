const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  displayName: 'io-fs',
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
