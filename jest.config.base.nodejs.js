const base = require('./jest.config.base')

module.exports = {
  ...base,
  testEnvironment: 'node',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit).[jt]s?(x)'],
}
