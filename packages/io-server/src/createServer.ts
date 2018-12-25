import { loadConfig, createSpecIO } from '@komondor-lab/io-fs';
import { Server, RequestInfo, ServerOptions, ServerInfo } from 'hapi';
import { IOServerOptions } from './interfaces';
import { unpartial } from 'unpartial'

const pjson = require('../package.json')

/**
 * @param options.port The port number to start the server with.
 * This should not be specified in normal use. For testing only.
 */
export function createServer(options?: IOServerOptions) {
  let { cwd, port } = unpartial({ cwd: process.cwd(), port: 3698 }, options)

  const startingPort = port
  let server = createHapiServer({ cwd, hapi: { port } })
  let retryCount = 0
  return {
    info: server.info,
    async start(): ReturnType<typeof server.start> {
      try {
        return await server.start()
      }
      catch (e) {
        if (e.code === 'EADDRINUSE') {
          port++
          retryCount++
          // istanbul ignore next
          if (retryCount >= 100) {
            throw new Error(`Unable to start komondor server using port from ${startingPort} to ${startingPort + 100}`)
          }
          server = createHapiServer({ cwd, hapi: { port } })
          this.info = server.info
          return this.start()
        }
        // istanbul ignore next
        throw e
      }
    },
    stop() {
      return server.stop()
    }
  }
}

function createHapiServer({ cwd, hapi }: { cwd: string, hapi: ServerOptions }) {

  let server = new Server(hapi)
  const spec = createSpecIO({ cwd })
  server.route([
    {
      method: 'GET',
      path: '/komondor/info',
      handler: (request) => {
        return JSON.stringify({
          name: 'komondor',
          version: pjson.version,
          url: getReflectiveUrl(request.info, server.info)
        })
      }
    },
    {
      method: 'GET',
      path: '/komondor/config',
      handler: async () => {
        return JSON.stringify(loadConfig(cwd))
      }
    },
    {
      method: 'GET',
      path: '/komondor/spec/{id}',
      handler: (request) => {
        return spec.read(request.params.id)
      }
    },
    {
      method: 'POST',
      path: '/komondor/spec/{id}',
      handler: async (request, h) => {
        await spec.write(request.params.id, request.payload as string)
        return h.response()
      }
    }
  ])
  return server
}

/**
 * If request is calling from local, return as localhost.
 */
function getReflectiveUrl(requestInfo: RequestInfo, serverInfo: ServerInfo) {
  if (requestInfo.hostname === 'localhost' || requestInfo.remoteAddress === '127.0.0.1') {
    return `${serverInfo.protocol}://localhost${serverInfo.port ? `:${serverInfo.port}` : ''}`
  }
  return serverInfo.uri
}
