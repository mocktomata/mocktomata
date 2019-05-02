const base = require('../../jest.config.node-base')

module.exports = {
  ...base,
  name: 'config',
  displayName: 'config',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts', '**/*.node-spec.ts'],
}
