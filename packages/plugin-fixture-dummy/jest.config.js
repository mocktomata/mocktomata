const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'plugin-fixture-dummy',
  displayName: 'plugin-fixture-dummy',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.node-spec.ts'],
}
