const base = require('./jest.config.base')

module.exports = {
  ...base,
  testEnvironment: 'jest-environment-jsdom-fifteen',
  testMatch: ['**/?*.spec(.jsdom)?.[jt]s?(x)'],
}
