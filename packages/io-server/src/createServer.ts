import { readSpec, writeSpec } from '@komondor-lab/io-fs';
import { Server, ServerOptions } from 'hapi';

const pjson = require('../package.json')

export function createServer() {
  let port = 3698
  const startingPort = port
  let server = createHapiServer({ port })
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
          server = createHapiServer({ port })
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
function createHapiServer(options: ServerOptions) {
  let server = new Server(options)

  server.route([
    {
      method: 'GET',
      path: '/komondor/info',
      handler: () => {
        return JSON.stringify({
          name: 'komondor',
          version: pjson.version
        })
      }
    },
    {
      method: 'GET',
      path: '/komondor/spec/{id}',
      handler: (request) => {
        return readSpec(request.params.id)
      }
    },
    {
      method: 'POST',
      path: '/komondor/spec/{id}',
      handler: async (request, h) => {
        await writeSpec(request.params.id, request.payload as string)
        return h.response()
      }
    }
  ])
  return server
}
