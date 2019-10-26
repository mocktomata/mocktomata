const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  displayName: 'plugin-nodejs',
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  }
}
