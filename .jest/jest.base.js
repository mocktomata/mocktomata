module.exports = {
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
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
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest'
  },
}
