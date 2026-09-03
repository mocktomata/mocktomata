import { required } from 'type-plus'
import { start } from './start.js'

export async function globalSetup(options?: start.Options) {
	const server = await start(required({ port: 3698, cwd: process.cwd() }, options))
	const servers = ((globalThis as any).__SERVERS__ = (globalThis as any).__SERVERS__ ?? [])
	servers.push(server)
}

export async function globalTeardown() {
	const servers = (globalThis as any).__SERVERS__
	if (servers) await Promise.all(servers.map((s: any) => s.stop()))
}
