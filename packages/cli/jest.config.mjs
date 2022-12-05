import { withChalk } from '@repobuddy/jest';
import preset from '@repobuddy/jest/presets/ts-esm'
import localPreset from '../../.jest/preset.js'

const chalkedPreset = withChalk(preset, 'cjs')

/** @type {import('jest').Config} */
export default {
  ...chalkedPreset,
  moduleNameMapper: {
    ...chalkedPreset.moduleNameMapper,
    ...localPreset.moduleNameMapper,
  },
  displayName: 'cli'
}
