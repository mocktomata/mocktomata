import preset from '@repobuddy/jest/presets/jsdom-ts'
import deepmerge from 'deepmerge'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	moduleNameMapper: localPreset.moduleNameMapper,
	displayName: 'jsdom'
})
