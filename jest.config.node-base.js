module.exports = {
  'globals': {
    'ts-jest': {
      babelConfig: true,
      'diagnostics': false,
      'tsConfig': {
        'module': 'esnext',
        'target': 'esnext',
      }
    }
  },
  moduleNameMapper: {
    '@mocktomata/(.*)/(.*)': '<rootDir>/../$1/src/$2',
    '@mocktomata/(.*)': '<rootDir>/../$1/src'
  },
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit).[jt]s?(x)']
};
