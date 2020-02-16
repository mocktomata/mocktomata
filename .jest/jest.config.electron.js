const base = require('./jest.config.base.electron')

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s',
    '!<rootDir>/src/bin.[jt]s',
    '!<rootDir>/src/**/*.spec.*'
  ],
  projects: [
    '<rootDir>/../packages/*/jest.config.electron.js'
  ],
  reporters: [
    'default'
  ]
}
