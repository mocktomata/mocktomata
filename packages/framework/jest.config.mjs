import preset from '@repobuddy/jest/presets/ts-watch'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'framework',
	preset: '@repobuddy/jest/presets/ts-watch',
	moduleNameMapper: {
		...preset.moduleNameMapper,
		...localPreset.moduleNameMapper
	},
	coveragePathIgnorePatterns: [
		'\\.(spec|test|unit|accept|integrate|system)(\\..*)?\\.(js|jsx|cjs|mjs|ts|tsx|cts|mts)$',
		'<rootDir>/ts/test-artifacts'
	],
}

export default config
