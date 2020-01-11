const base = require('./jest.base-config')

module.exports = {
  ...base,
  testEnvironment: 'jest-environment-jsdom-fifteen',
  testMatch: ['**/?*.(jsdom).[jt]s?(x)'],
}
