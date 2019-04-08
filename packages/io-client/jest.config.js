const base = require('@unional/devpkg-node/simple/config/jest.common')


module.exports = {
  ...base,
  name: 'io-client',
  displayName: 'io-client',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.ts', '**/*.node-spec.ts'],
}
