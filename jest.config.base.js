module.exports = {
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: false
    }
  },
  moduleNameMapper: {
    '@mocktomata/(plugin-fixture-deep-link.*)': '<rootDir>/../$1',
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src',
    'mocktomata': '<rootDir>/../mocktomata/src'
  },
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src'
  ],
}
