const merge = require('merge')
const ts_preset = require('ts-jest/jest-preset')
const puppeteer_preset = require('jest-puppeteer/jest-preset')

module.exports = merge.recursive(ts_preset, puppeteer_preset, {
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
  'watchPlugins': [
    'jest-watch-repeat',
    ['jest-watch-suspend'],
    ['jest-watch-toggle-config', { 'setting': 'verbose' }],
    ['jest-watch-toggle-config', { 'setting': 'collectCoverage' }]
  ]
});
