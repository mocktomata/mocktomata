const base = require('./jest.config.base')

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit)(.jsdom)?.[jt]s?(x)'],
}
