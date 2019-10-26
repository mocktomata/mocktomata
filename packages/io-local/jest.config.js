const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  displayName: 'io-local',
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
