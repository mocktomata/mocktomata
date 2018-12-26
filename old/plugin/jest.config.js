const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'komondor-plugin',
  displayName: 'komondor-plugin',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'node'
}
