const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  name: 'spec',
  displayName: 'spec',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
}
