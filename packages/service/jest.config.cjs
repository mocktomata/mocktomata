const base = require('../../.jest/jest.nodejs')

module.exports = {
  ...base,
  displayName: 'file-server',
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch))'
  ]
}
