import preset from '@repobuddy/jest/presets/electron-renderer-ts-watch'
import deepmerge from 'deepmerge'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	displayName: 'io-remote:electron-renderer',
	moduleNameMapper: localPreset.moduleNameMapper,
	globalSetup: './scripts/start_server.cjs',
	globalTeardown: './scripts/stop_server.cjs'
})
