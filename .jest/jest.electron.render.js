const base = require('./jest.base')

module.exports = {
  ...base,
  runner: '@kayahr/jest-electron-runner',
  testEnvironment: '@kayahr/jest-electron-runner/environment',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit).[jt]s?(x)'],
}
