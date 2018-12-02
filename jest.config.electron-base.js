module.exports = {
  'globals': {
    'ts-jest': {
      'diagnostics': false
    }
  },
  preset: 'ts-jest',
  'reporters': [
    'default',
    'jest-progress-tracker',
    ['jest-audio-reporter', { volume: 0.3 }],
  ],
  runner: '@jest-runner/electron',
  'testEnvironment': '@jest-runner/electron/environment',
  'watchPlugins': [
    'jest-watch-repeat',
    ['jest-watch-suspend'],
    ['jest-watch-toggle-config', { 'setting': 'verbose' }],
    ['jest-watch-toggle-config', { 'setting': 'collectCoverage' }]
  ]
};
