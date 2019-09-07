const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  displayName: 'moctomata',
  roots: [
    '<rootDir>/src'
  ]
}
