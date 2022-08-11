const base = require('./jest.base')

module.exports = {
  ...base,
  runner: '@kayahr/jest-electron-runner/main',
  testEnvironment: 'node',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit)(.electron)?.[jt]s?(x)'],
}
