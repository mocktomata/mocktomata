import { readSpec, writeSpec } from '@komondor-lab/io-fs';
import { Server } from 'hapi';
import { IOServerOptions } from './interfaces';

export function createServer(options: IOServerOptions) {
  const server = new Server({ port: options.port })
  server.route([
    {
      method: 'GET',
      path: '/spec/{id}',
      handler: (request) => {
        return readSpec(request.params.id)
      }
    },
    {
      method: 'POST',
      path: '/spec/{id}',
      handler: async (request, h) => {
        await writeSpec(request.params.id, request.payload as string)
        return h.response()
      }
    }
  ])
  return server
}
