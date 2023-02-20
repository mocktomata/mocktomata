import { json, SpecNotFound, type Mocktomata, type SpecPlugin, type SpecRecord } from '@mocktomata/framework'
import { IOOptions } from './io.types.js'
import { getServerInfo } from './server_info.js'
import { buildUrl } from './url.js'

export type Context = {
	fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>
	importModule(moduleSpecifier: string): Promise<SpecPlugin.Module>
}

export async function createIOInternal(ctx: Context, options: IOOptions): Promise<Mocktomata.IO> {
	return {
		async loadConfig() {
			const info = await getServerInfo(ctx, options)
			// @TODO add browser config?
			const url = buildUrl(info.url, `config`)
			const response = await ctx.fetch(url)
			return response.json()
		},
		async loadPlugin(name: string): Promise<SpecPlugin.Module> {
			return ctx.importModule(name)
		},
		async readSpec(specName: string, specRelativePath: string): Promise<SpecRecord> {
			const info = await getServerInfo(ctx, options)
			const id = btoa(json.stringify({ specName, specRelativePath }))
			const response = await ctx.fetch(buildUrl(info.url, `specs/${id}`))
			if (response.status === 404) {
				throw new SpecNotFound(id, specRelativePath)
			}
			return response.json()
		},
		async writeSpec(specName, specRelativePath, record) {
			const info = await getServerInfo(ctx, options)
			const id = btoa(json.stringify({ specName, specRelativePath }))
			const response = await ctx.fetch(buildUrl(info.url, `specs/${id}`), {
				method: 'POST',
				body: json.stringify(record)
			})
			// istanbul ignore next
			if (!response.ok) {
				throw new Error(`failed to write spec: ${response.statusText}`)
			}
		}
	}
}
