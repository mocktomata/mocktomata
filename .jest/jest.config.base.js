module.exports = {
  moduleNameMapper: {
    '^@mocktomata/(plugin-fixture-deep-link.*)': '<rootDir>/../$1',
    '^@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '^@mocktomata/(.*)': '<rootDir>/../$1/src',
    '^mocktomata': '<rootDir>/../mocktomata/src'
  },
  roots: [
    '<rootDir>/src'
  ],
  setupFiles: [
    '../../scripts/jest-setup.js'
  ],
}
