import { start } from './start.js'

export async function globalSetup(port = 3698) {
	const server = await start({ port })
	;(globalThis as any).__SERVER__ = server
}

export async function globalTeardown() {
	await (globalThis as any).__SERVER__.stop()
}
