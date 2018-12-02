const base = require('./jest.config.node-base')
module.exports = {
  ...base,
  'projects': [
    '<rootDir>/packages/*/src'
  ]
}
