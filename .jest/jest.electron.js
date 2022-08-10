const base = require('./jest.base')

module.exports = {
  ...base,
  runner: '@jest-runner/electron/main',
  testEnvironment: 'node',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit)(.electron)?.[jt]s?(x)'],
}
