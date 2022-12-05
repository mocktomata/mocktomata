import preset from '@repobuddy/jest/presets/ts-esm'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default {
  ...preset,
  ...localPreset,
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    ...localPreset.moduleNameMapper,
  },
  displayName: 'mocktomata'
}
