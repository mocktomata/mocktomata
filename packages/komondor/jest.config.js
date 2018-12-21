const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  name: 'komondor',
  displayName: 'komondor',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
}
