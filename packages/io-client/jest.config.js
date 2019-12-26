const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  displayName: 'io-client',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
