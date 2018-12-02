const base = require('../../jest.config.base')

module.exports = {
  ...base,
  name: 'komondor',
  displayName: 'komondor',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
}
