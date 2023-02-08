import preset from '@repobuddy/jest/presets/ts-watch'
import deepmerge from 'deepmerge'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	moduleNameMapper: localPreset.moduleNameMapper,
	coveragePathIgnorePatterns: ['<rootDir>/ts/test-artifacts'],
	displayName: 'framework'
})
