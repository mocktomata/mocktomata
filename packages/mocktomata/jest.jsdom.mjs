import preset from '@repobuddy/jest/presets/jsdom-ts-watch'
import deepmerge from 'deepmerge'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	displayName: 'mocktomata:jsdom',
	setupFiles: ['./scripts/start_server.mjs'],
	moduleNameMapper: localPreset.moduleNameMapper,
})
