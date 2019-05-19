const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  name: 'io-client',
  displayName: 'io-client',
  roots: [
    '<rootDir>/src'
  ],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.ts'],
}
