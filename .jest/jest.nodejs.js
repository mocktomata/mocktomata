const base = require('./jest.base')
const watch = require('./jest.watch')

module.exports = {
  ...base,
  testEnvironment: 'node',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit).[jt]s?(x)'],
  ...watch
}
