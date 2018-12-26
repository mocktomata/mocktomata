const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  projects: [
    '<rootDir>/packages/*/src'
  ],
  testMatch: [
    '**/*.spec.ts',
    '**/*.node-spec.ts'
  ]
}
