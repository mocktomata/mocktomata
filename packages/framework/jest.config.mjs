import preset from '@repobuddy/jest/presets/ts-esm'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default {
  ...preset,
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    ...localPreset.moduleNameMapper,
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/ts/test-artifacts',
  ],
  displayName: 'framework'
}
