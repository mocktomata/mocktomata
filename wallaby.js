module.exports = function (wallaby) {
  return {
    "files": [
      { pattern: 'tsconfig.*', instrument: false },
      "src/**/*.ts",
      "!src/**/*.spec.ts"
    ],
    "tests": [
      "src/**/*.spec.ts"
    ],
    "env": {
      "type": "node"
    },
    compilers: {
      'src/**/*.ts': wallaby.compilers.typeScript({ module: 'commonjs' }),
    },
    testFramework: 'ava'
  }
}
