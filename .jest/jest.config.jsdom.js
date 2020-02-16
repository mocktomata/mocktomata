const base = require('./jest.config.base.jsdom')

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.[jt]s',
    '!<rootDir>/src/bin.[jt]s',
    '!<rootDir>/src/**/*.spec.*'
  ],
  projects: [
    '<rootDir>/../packages/*/jest.config.jsdom.js'
  ],
  reporters: [
    'default'
  ]
}
