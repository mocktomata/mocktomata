const watch = require('./.jest/jest.watch')

const projects = process.env.JEST_ENV
  ? [`<rootDir>/packages/*/jest.config${process.env.JEST_ENV === 'nodejs' ? '' : '.' + process.env.JEST_ENV}.js`]
  : [
    '<rootDir>/packages/*/jest.config.js',
    // '<rootDir>/packages/*/jest.config.electron.js',
    '<rootDir>/packages/*/jest.config.jsdom.js'
  ]
module.exports = {
  collectCoverageFrom: [
    '<rootDir>/ts/**/*.[jt]s',
    '!<rootDir>/ts/bin.[jt]s',
    '!<rootDir>/ts/**/*.spec.*'
  ],
  projects,
  ...watch
}
