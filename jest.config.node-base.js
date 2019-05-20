module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsConfig: '<rootDir>/tsconfig.jest.json'
    }
  },
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/?*.(spec|test|integrate|accept|system|unit).[jt]s?(x)']
};
