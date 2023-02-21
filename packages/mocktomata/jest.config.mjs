import { watchPlugins } from '@repobuddy/jest'
/** @type {import('jest').Config} */
const config = {
	projects: [
		'./jest.electron.mjs',
		'./jest.jsdom.mjs',
		'./jest.nodejs.mjs'
	],
	globalSetup: './scripts/jest/global_setup.cjs',
	globalTeardown: './scripts/jest/global_teardown.cjs',
	watchPlugins
}

export default config
