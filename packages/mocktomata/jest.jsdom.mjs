import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'jsdom',
	preset: '@repobuddy/jest/presets/jsdom-ts-watch',
	moduleNameMapper: localPreset.moduleNameMapper
}

export default config
