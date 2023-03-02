import { knownTransforms } from '@repobuddy/jest'
import localPreset from '../../.jest/preset.js'

/** @type {import('jest').Config} */
const config = {
	displayName: 'electron-renderer',
	preset: '@repobuddy/jest/presets/electron-renderer-ts-esm-watch',
	moduleNameMapper: localPreset.moduleNameMapper,
	testMatch: ['**/?*\\.(spec|test|unit|accept|integrate|system)?(.electron_renderer).(js|jsx|cjs|mjs|ts|tsx|cts|mts)'],
	transform: knownTransforms.tsJestEsm({ tsconfig: 'tsconfig.cjs.json' }),
	// globalSetup: './scripts/jest/global_setup.cjs',
	// globalTeardown: './scripts/jest/global_teardown.cjs'
}

export default config
