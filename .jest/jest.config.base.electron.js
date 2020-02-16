const base = require('./jest.config.base')

module.exports = {
  ...base,
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit)(.electron)?.[jt]s?(x)'],
}
