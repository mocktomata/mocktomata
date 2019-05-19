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
  ]
  // 'reporters': [
  //   'default',
  //   'jest-progress-tracker',
  //   ['jest-audio-reporter', { volume: 0.3 }],
  // ],
  // 'testEnvironment': 'node',
  // testMatch: [
  //   '**/*.spec.ts',
  //   '**/*.node-spec.ts'
  // ],
  // 'watchPlugins': [
  //   'jest-watch-repeat',
  //   ['jest-watch-suspend'],
  //   ['jest-watch-toggle-config', { 'setting': 'verbose' }],
  //   ['jest-watch-toggle-config', { 'setting': 'collectCoverage' }]
  // ]
};
