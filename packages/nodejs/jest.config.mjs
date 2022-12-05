import { withChalk } from '@repobuddy/jest'
import preset from '@repobuddy/jest/presets/ts-esm'
import localPreset from '../../.jest/preset.js'

const base = withChalk(preset)

/** @type {import('jest').Config} */
export default {
  ...base,
  moduleNameMapper: {
    ...base.moduleNameMapper,
    ...localPreset.moduleNameMapper,
  },
  displayName: 'nodejs'
}
