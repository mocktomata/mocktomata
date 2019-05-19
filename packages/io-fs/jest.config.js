const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'io-fs',
  displayName: 'io-fs',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
}
