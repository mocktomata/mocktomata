import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'jsdom',
	preset: '@repobuddy/jest/presets/jsdom-ts-watch',
	moduleNameMapper: localPreset.moduleNameMapper,
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		// fail to run these probably due to the adapter: html issue.
		'<rootDir>/ts/browser/'
	]
}

export default config
