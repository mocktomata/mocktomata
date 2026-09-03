import { globalSetup, globalTeardown } from '@mocktomata/service/testing'

export async function setup() {
	await globalSetup({ cwd: './fixtures/service' })
	await globalSetup({ cwd: './fixtures/es2015', port: 3699 })
}

export async function teardown() {
	await globalTeardown()
}
