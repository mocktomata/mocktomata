import fetch from 'cross-fetch';
import { IOClientOptions } from './interfaces';

export type ServerInfo = {
  version: string
  url: string
}

export async function getServerInfo(options?: IOClientOptions): Promise<ServerInfo> {
  return options ? tryGetServerInfo(options.url) : lookupServerInfo()
}

async function lookupServerInfo() {
  if (location.hostname === 'localhost') {
    let serverInfo = undefined
    let count = 0
    while (!serverInfo && count < 100) {
      serverInfo = await tryGetServerInfo(`${location.protocol}//localhost:${3698 + count}`)
      count++
    }
    return serverInfo
  }
  // istanbul ignore next
  else {
    return tryGetServerInfo(`${location.protocol}//${location.hostname}`)
  }
}

async function tryGetServerInfo(url: string) {
  try {
    const response = await fetch(`${url}/komondor/info`)
    return response.json()
  }
  catch (e) {
    if (e.code === 'ECONNREFUSED') {
      return undefined
    }
    // istanbul ignore next
    throw e
  }
}
