import { createFileIO } from '@komondor-lab/io-fs';
import { RequestInfo, Server, ServerInfo, ServerOptions } from 'hapi';
import path from 'path';
import { unpartial } from 'unpartial';
import { IOServerOptions } from './interfaces';

const pjson = require(path.resolve(__dirname, '../package.json'))

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
    async start(): Promise<void> {
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
          server = createHapiServer({ cwd, hapi: { port, routes: { 'cors': true } } })
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
  const io = createFileIO(cwd)
  server.route([
    {
      method: 'GET',
      path: '/komondor/info',
      options: { cors: true },
      handler: async (request) => {
        return JSON.stringify({
          name: 'komondor',
          version: pjson.version,
          url: getReflectiveUrl(request.info, server.info),
          plugins: await io.getPluginList()
        })
      }
    },
    // {
    //   method: 'GET',
    //   path: '/komondor/config',
    //   options: { cors: true },
    //   handler: async (request, h) => {
    //     return JSON.stringify(loadConfig(cwd))
    //   }
    // },
    {
      method: 'GET',
      path: '/komondor/specs/{id}',
      handler: (request) => {
        return io.readSpec(request.params.id)
      }
    },
    {
      method: 'POST',
      path: '/komondor/specs/{id}',
      handler: async (request, h) => {
        await io.writeSpec(request.params.id, request.payload as string)
        return h.response()
      }
    },
    {
      method: 'GET',
      path: '/komondor/scenarios/{id}',
      handler: (request) => {
        return io.readScenario(request.params.id)
      }
    },
    {
      method: 'POST',
      path: '/komondor/scenarios/{id}',
      handler: async (request, h) => {
        await io.writeScenario(request.params.id, request.payload as string)
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
  if (requestInfo.remoteAddress === '127.0.0.1') {
    return `${serverInfo.protocol}://localhost:${serverInfo.port}`
  }
  // istanbul ignore next
  return serverInfo.uri
}
