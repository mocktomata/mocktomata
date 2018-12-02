const base = require('../../jest.config.electron-base')

module.exports = {
  ...base,
  name: 'core',
  displayName: 'core',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
}
