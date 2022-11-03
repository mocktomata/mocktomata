const base = require('../../.jest/jest.nodejs')

module.exports = {
  ...base,
  displayName: 'service',
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch))'
  ]
}
