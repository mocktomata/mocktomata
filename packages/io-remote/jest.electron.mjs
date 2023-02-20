import base from '../../.jest/jest.electron.render.js'

/** @type {import('jest').Config} */
export default {
	...base,
	displayName: 'io-remote',
	globalSetup: './scripts/start_server.cjs',
	globalTeardown: './scripts/stop_server.cjs'
}
