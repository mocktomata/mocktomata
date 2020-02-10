const base = require('./jest.config.base')

module.exports = {
  ...base,
  runner: '@jest-runner/electron',
  testEnvironment: '@jest-runner/electron/environment',
  testMatch: ['**/?*.spec.electron.render.[jt]s?(x)'],
}
