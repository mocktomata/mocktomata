import { IOOptions } from '@komondor-lab/core'
import { Server } from 'hapi';
import { readSpec, writeSpec } from '@komondor-lab/io-fs'

export type IOServerContext = {
  ui: any
}

export function createServer(context: IOServerContext, options: IOOptions) {
  const server = new Server()
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
      handler: (request, h) => {
        return writeSpec(request.params.id, request.payload as string)
      }
    }
  ])
  return server
}
