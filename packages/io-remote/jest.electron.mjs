import preset from '@repobuddy/jest/presets/electron-renderer-ts-watch'
import deepmerge from 'deepmerge'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	displayName: 'mocktomata:electron-renderer',
	moduleNameMapper: localPreset.moduleNameMapper,
	globalSetup: './scripts/jest/global_setup.cjs',
	globalTeardown: './scripts/jest/global_teardown.cjs'
})
