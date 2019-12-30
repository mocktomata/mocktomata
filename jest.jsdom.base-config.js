const base = require('./jest.base-config')

module.exports = {
  ...base,
  testEnvironment: 'jest-environment-jsdom-fifteen',
  testMatch: ['**/?*.(browser).[jt]s?(x)'],
}
