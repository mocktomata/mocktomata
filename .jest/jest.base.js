const path = require('node:path')

const chalk = require.resolve('chalk')
const chalkRootDir = chalk.slice(0, chalk.lastIndexOf('chalk'))
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@mocktomata/(plugin-fixture-deep-link.*)': '<rootDir>/../../test-plugins/$1',
    // '^@mocktomata/(.*)/(.*)': '<rootDir>/../$1/ts/$2',
    '^@mocktomata/(.*)': '<rootDir>/../../packages/$1/ts',
    '^mocktomata': '<rootDir>/../../packages/mocktomata/ts',
    // remove the phantom `.js` extension
    '^(\\.{1,2}/.*)\\.js$': '$1',
    chalk,
    '#ansi-styles': path.join(
      chalkRootDir,
      'chalk/source/vendor/ansi-styles/index.js',
    ),
    '#supports-color': path.join(
      chalkRootDir,
      'chalk/source/vendor/supports-color/index.js',
    )
  },
  roots: [
    '<rootDir>/ts'
  ],
  transform: {
    '^.+\\.m?[t]sx?$': ['ts-jest', {
      isolatedModules: true,
      useESM: true
    }],
  },
}
