import { watchPlugins } from '@repobuddy/jest'
/** @type {import('jest').Config} */
const config = {
	projects: [
		'./jest.jsdom.mjs',
		'./jest.nodejs.mjs'
	],
	watchPlugins
}

export default config
