import { ServerNotAvailable } from './errors.js'
import { Context } from './io.internal.js'
import type { ServiceOptions } from './io.types.js'
import { buildUrl } from './url.js'

export type ServerInfo = {
	name: string
	version: string
	url: string
	// TODO: server not returning plugins
	plugins?: string[]
}

export async function getServerInfo(
	{ fetch }: Pick<Context, 'fetch'>,
	{ url }: ServiceOptions
): Promise<ServerInfo> {
	try {
		const response = await fetch(buildUrl(url, 'info'))
		return response.json()
	} catch (e: any) {
		throw e.code === 'ECONNREFUSED' ? new ServerNotAvailable(url) : e
	}
}
