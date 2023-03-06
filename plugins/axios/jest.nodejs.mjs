import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'nodejs',
	preset: '@repobuddy/jest/presets/ts-watch',
	moduleNameMapper: localPreset.moduleNameMapper
}
export default config
