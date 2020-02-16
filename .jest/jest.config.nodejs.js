const base = require('./jest.config.base.nodejs')

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s',
    '!<rootDir>/src/bin.[jt]s',
    '!<rootDir>/src/**/*.spec.*'
  ],
  projects: [
    '<rootDir>/../packages/*/jest.config.js'
  ],
  reporters: [
    'default'
  ]
}
