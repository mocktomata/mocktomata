import fetch from 'cross-fetch';
import { buildUrl } from './buildUrl';
import { ServerNotAvailable, ServerNotAvailableAtPortRange } from './errors';
import { CreateIOOptions } from './types';

export type ServerInfo = {
  version: string
  url: string,
  plugins: string[]
}

export async function getServerInfo(options?: CreateIOOptions): Promise<ServerInfo> {
  return options ? tryGetServerInfo(options.url) : lookupServerInfo()
}

async function tryGetServerInfo(url: string): Promise<ServerInfo> {
  try {
    const response = await fetch(buildUrl(url, 'info'))
    return response.json()
  }
  catch (e) {
    if (e.code === 'ECONNREFUSED') {
      throw new ServerNotAvailable(url)
    }
    // istanbul ignore next
    throw e
  }
}

async function lookupServerInfo() {
  const url = `${location.protocol}//${location.hostname}`

  if (location.hostname === 'localhost') {
    return tryGetServerInfoAtPort(url, 3698, 3698, 3708)
  }
  // istanbul ignore next
  else {
    return tryGetServerInfo(`${location.protocol}//${location.hostname}`)
  }
}

async function tryGetServerInfoAtPort(urlBase: string, port: number, start: number, end: number): Promise<ServerInfo> {
  // istanbul ignore next
  if (port >= end) {
    throw new ServerNotAvailableAtPortRange(urlBase, start, end)
  }
  const url = `${urlBase}:${port}`

  try {
    return tryGetServerInfo(url)
  }
  catch {
    // istanbul ignore next
    return tryGetServerInfoAtPort(urlBase, port + 1, start, end)
  }
}
