const base = require('./jest.config.base')

module.exports = {
  ...base,
  testEnvironment: 'jest-environment-jsdom-fifteen',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit)(.jsdom)?.[jt]s?(x)'],
}
