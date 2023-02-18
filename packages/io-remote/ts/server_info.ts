import { buildUrl } from './url.js'
import { ServerNotAvailable, ServerNotAvailableAtPortRange } from './errors.js'
import type { ServiceOptions } from './types.js'

export type ServerInfo = {
	name: string
	version: string
	url: string
	// TODO: server not returning plugins
	plugins?: string[]
}

export type Context = {
	fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>
	location: {
		protocol: string
		hostname: string
	}
}

export async function getServerInfo(context: Context, options?: ServiceOptions): Promise<ServerInfo> {
	return options ? tryGetServerInfo(context, options.url) : lookupServerInfo(context)
}

async function lookupServerInfo(context: Context) {
	const { location } = context
	const url = `${location.protocol}//${location.hostname}`
	if (location.hostname === 'localhost') {
		return tryGetServerInfoAtPort(context, url, 3698, 3698, 3708)
	} else {
		return tryGetServerInfo(context, url)
	}
}

async function tryGetServerInfoAtPort(
	context: Context,
	urlBase: string,
	port: number,
	start: number,
	end: number
): Promise<ServerInfo> {
	if (port >= end) {
		throw new ServerNotAvailableAtPortRange(urlBase, start, end)
	}

	const url = `${urlBase}:${port}`

	try {
		return await tryGetServerInfo(context, url)
	} catch (e: any) {
		return tryGetServerInfoAtPort(context, urlBase, port + 1, start, end)
	}
}

async function tryGetServerInfo({ fetch }: Context, url: string): Promise<ServerInfo> {
	try {
		const response = await fetch(buildUrl(url, 'info'))
		return response.json()
	} catch (e: any) {
		throw e.code === 'ECONNREFUSED' ? new ServerNotAvailable(url) : e
	}
}
