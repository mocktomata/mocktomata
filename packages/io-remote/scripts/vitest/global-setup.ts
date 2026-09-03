import { globalSetup, globalTeardown } from '@mocktomata/service/testing'

export async function setup() {
	await globalSetup({ cwd: './fixtures/service', port: 3789 })
}

export async function teardown() {
	await globalTeardown()
}
