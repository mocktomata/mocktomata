const base = require('../../.jest/jest.nodejs')

module.exports = {
  ...base,
  displayName: 'framework',
  coveragePathIgnorePatterns: [
    '<rootDir>/ts/test-artifacts',
  ]
}
