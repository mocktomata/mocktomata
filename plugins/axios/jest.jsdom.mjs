import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'browser',
	preset: '@repobuddy/jest/presets/jsdom-ts-watch',
	moduleNameMapper: localPreset.moduleNameMapper
}
export default config
