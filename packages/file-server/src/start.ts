import { SpecPlugin } from '@mocktomata/framework'
import { FileRepository } from '@mocktomata/io-fs'
import boom from 'boom'
import { RequestInfo, Server, ServerInfo, ServerRoute } from 'hapi'
import { atob } from './base64'

export namespace start {
  export type Config = {
    'file-server'?: {
      port?: number
    }
  } & SpecPlugin.Config
  export type Options = {
    /**
     * Port number the server will run on.
     */
    port?: number,
    cwd?: string
  }
}

export async function start(options: start.Options = {}) {
  const cwd = options.cwd ?? process.cwd()
  const repo = new FileRepository({ cwd })
  const config = repo.loadConfig() as start.Config
  const port = options.port ?? config['file-server']?.port ?? 80
  const context = { config, repo }
  const server = new Server({ port, routes: { 'cors': true } })
  await server.start()
  server.route([
    infoRoute(context, server),
    configRoute(context),
    specGetRoute(context),
    specPostRoute(context)
  ])
  return {
    info: server.info,
    stop(options?: { timeout: number }) {
      return server.stop(options)
    }
  }
}

type Context = {
  repo: FileRepository
}

function infoRoute({ repo }: Context, server: Server): ServerRoute {
  return {
    method: 'GET',
    path: '/mocktomata/info',
    handler: async (request) => {
      const config = repo.loadConfig()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pjson = require('../package.json')
      return JSON.stringify({
        name: 'mocktomata',
        version: pjson.version,
        url: getReflectiveUrl(request.info, server.info),
        plugins: config.plugins || []
      })
    }
  }
}

function configRoute({ repo }: Context): ServerRoute {
  return {
    method: 'GET',
    path: '/mocktomata/config',
    options: { cors: true },
    handler: async () => {
      const config = repo.loadConfig()
      return JSON.stringify(config)
    }
  }
}

function specGetRoute({ repo }: Context): ServerRoute {
  return {
    method: 'GET',
    path: '/mocktomata/specs/{id}',
    handler: async (request) => {
      try {
        const { specName, specRelativePath } = JSON.parse(atob(request.params.id))
        return await repo.readSpec(specName, specRelativePath)
      }
      catch (e) {
        throw boom.notFound(e.message)
      }
    }
  }
}

function specPostRoute({ repo }: Context): ServerRoute {
  return {
    method: 'POST',
    path: '/mocktomata/specs/{id}',
    handler: async (request, h) => {
      const { specName, specRelativePath } = JSON.parse(atob(request.params.id))
      await repo.writeSpec(specName, specRelativePath, request.payload as string)
      return h.response()
    }
  }
}

/**
 * If request is calling from local, return as localhost.
 */
// istanbul ignore next
function getReflectiveUrl(requestInfo: RequestInfo, serverInfo: ServerInfo) {
  if (requestInfo.remoteAddress === '127.0.0.1') {
    return `${serverInfo.protocol}://localhost:${serverInfo.port}`
  }
  return serverInfo.uri
}
