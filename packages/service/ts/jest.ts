import { required } from 'type-plus'
import { start } from './start.js'

export async function globalSetup(options?: start.Options) {
	const server = await start(required({ port: 3698, cwd: process.cwd() }, options))
	;(globalThis as any).__SERVER__ = server
}

export async function globalTeardown() {
	await (globalThis as any).__SERVER__.stop()
}
