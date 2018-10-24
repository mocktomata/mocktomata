module.exports = {
  'preset': 'ts-jest',
  'globals': {
    'ts-jest': {
      'diagnostics': false
    }
  },
  'reporters': [
    'default',
    '@unional/jest-progress-reporter',
    ['jest-audio-reporter', { volume: 0.3 }],
  ],
  'roots': [
    '<rootDir>/src'
  ],
  'testEnvironment': 'node',
  'testMatch': ['**/*.spec.ts'],
  'watchPlugins': [
    [
      'jest-watch-suspend'
    ],
    [
      'jest-watch-toggle-config',
      {
        'setting': 'verbose'
      }
    ],
    [
      'jest-watch-toggle-config',
      {
        'setting': 'collectCoverage'
      }
    ]
  ]
}
