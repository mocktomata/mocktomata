const base = require('./jest.config.base')

module.exports = {
  ...base,
  runner: '@jest-runner/electron/main',
  testEnvironment: '@jest-runner/electron/environment',
  testMatch: ['**/?*.spec(.electron)?.[jt]s?(x)'],
}
