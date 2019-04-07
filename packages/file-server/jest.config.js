const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'io-server',
  displayName: 'io-server',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.node-spec.ts'],
}
