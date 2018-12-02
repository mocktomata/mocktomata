module.exports = {
  'preset': 'ts-jest',
  'globals': {
    'ts-jest': {
      'diagnostics': false
    }
  },
  'reporters': [
    'default',
    'jest-progress-tracker',
    ['jest-audio-reporter', { volume: 0.3 }],
  ],
  'roots': [
    '<rootDir>/src2'
  ],
  'setupFiles': [
    '<rootDir>/scripts/setup-test-env.js'
  ],
  'testEnvironment': 'node',
  'testMatch': ['**/*.spec.ts'],
  'watchPlugins': [
    'jest-watch-repeat',
    ['jest-watch-suspend'],
    ['jest-watch-toggle-config', { 'setting': 'verbose' }],
    ['jest-watch-toggle-config', { 'setting': 'collectCoverage' }]
  ]
}
