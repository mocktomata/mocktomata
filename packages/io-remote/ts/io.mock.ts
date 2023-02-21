import { Config, json, SpecPlugin } from '@mocktomata/framework'
import * as f from 'cross-fetch'
import type { Context } from './io.internal.js'
import type { ServerInfo } from './server_info.js'

export function newMemoryContext({ url } = { url: 'http://localhost:3789' }): Context {
	const store = {
		info: {
			name: 'mocktomata',
			version: '8.0.4',
			url
		} satisfies ServerInfo,
		config: {
			ecmaVersion: 'es2015',
			plugins: []
		} satisfies Config.Input,
		modules: {} as Record<string, SpecPlugin.Module>
	}
	const urlBase = store.info.url
	return {
		async fetch(url) {
			switch (true) {
				case url === `${urlBase}/api/info`:
					return new Response(JSON.stringify(store.info))
				case url === `${urlBase}/api/config`:
					return new Response(JSON.stringify(store.config))
				default:
					throw new Error(`not supported: ${url}`)
			}
		},
		async importModule(moduleSpecifier) {
			return store.modules[moduleSpecifier]
		}
	}
}

export function createFakeServerFetch() {
	const specs: Record<string, any> = {
		exist: { actions: [] }
	}

	const scenarios: Record<string, any> = {
		exist: { scenario: 'exist' }
	}

	return Object.assign(
		async (url: RequestInfo, init?: RequestInit) => {
			const uri = extractUri(url as string)
			if (uri === 'api/info') {
				return new f.Response(
					json.stringify({
						url: 'http://localhost:3999',
						version: '1.0'
					})
				)
			} else if (uri === 'api/config') {
				return new f.Response(
					json.stringify({
						plugins: ['@mocktomata/plugin-fixture-dummy']
					})
				)
				// istanbul ignore next
			} else if (uri.startsWith('api/specs/')) {
				const id = /api\/specs\/(.*)/.exec(uri)![1]
				const { specName } = json.parse(atob(id))
				if (init && init.method === 'POST') {
					specs[specName] = json.parse(init.body as string)
					return new f.Response(undefined)
				} else {
					if (specs[specName]) return new f.Response(json.stringify(specs[specName]))
					else return new f.Response(undefined, { status: 404 })
				}
			}
			// istanbul ignore next
			console.error(url)
			// istanbul ignore next
			return new f.Response(undefined, { status: 404 })
		},
		{
			specs,
			scenarios
		}
	)
}

function extractUri(url: string) {
	const match = /https?:\/\/\w*:\d+\/(.*)/.exec(url)
	// istanbul ignore next
	if (!match) throw match
	return match[1]
}
