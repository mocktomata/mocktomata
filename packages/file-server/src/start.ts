import { createFileRepository, FileRepositoryOptions, Repository } from '@mocktomata/io-fs';
import boom from 'boom';
import { RequestInfo, Server, ServerInfo } from 'hapi';
import { required } from 'type-plus';
import { atob } from './base64';

export type StartOptions = {
  /**
   * Port number the server will run on.
   */
  port: number,
  cwd: string,
  repoOptions: Partial<FileRepositoryOptions>
}

export async function start(options?: Partial<StartOptions>) {
  const { cwd, port, repoOptions } = required({ cwd: process.cwd(), port: 80 }, options)
  const repo = createFileRepository(cwd, repoOptions)

  const server = new Server({
    port,
    routes: { 'cors': true }
  })
  await server.start()
  defineRoutes(server, repo)
  return {
    info: server.info,
    stop(options?: { timeout: number }) {
      return server.stop(options)
    }
  }
}

function defineRoutes(server: Server, repo: Repository) {
  server.route([
    {
      method: 'GET',
      path: '/mocktomata/info',
      handler: async (request) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pjson = require('../package.json')
        return JSON.stringify({
          name: 'mocktomata',
          version: pjson.version,
          url: getReflectiveUrl(request.info, server.info),
          plugins: await repo.getPluginList()
        })
      }
    },
    // {
    //   method: 'GET',
    //   path: '/mocktomata/config',
    //   options: { cors: true },
    //   handler: async (request, h) => {
    //     return JSON.stringify(loadConfig(cwd))
    //   }
    // },
    {
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
    },
    {
      method: 'POST',
      path: '/mocktomata/specs/{id}',
      handler: async (request, h) => {
        const { specName, specRelativePath } = JSON.parse(atob(request.params.id))
        await repo.writeSpec(specName, specRelativePath, request.payload as string)
        return h.response()
      }
    },
  ])
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
