module.exports = {
  'preset': 'ts-jest',
  'globals': {
    'ts-jest': {
      'diagnostics': false
    }
  },
  'projects': [
    '<rootDir>/packages/*/src'
  ],
  'testEnvironment': 'node',
  'testMatch': ['**/*.spec.ts'],
  'reporters': [
    'default',
    [
      'jest-junit',
      {
        'output': '.reports/junit/js-test-results.xml'
      }
    ]
  ]
}
