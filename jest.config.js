const base = require('@unional/devpkg-node/simple/config/jest.common')

module.exports = {
  ...base,
  'globals': {
    'ts-jest': {
      'diagnostics': false,
      'tsConfig': {
        'target': 'es2015'
      }
    }
  },
  projects: [
    '<rootDir>/packages/*'
  ]
}
