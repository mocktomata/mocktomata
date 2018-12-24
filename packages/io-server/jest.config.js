const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'io-service',
  displayName: 'io-service',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.node-spec.ts'],
}
