const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  name: 'core',
  displayName: 'core',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
}
