import { IOOptions } from '@komondor-lab/core';
import { createServer } from './createServer';

export type IOServerContext = {
  ui: any
}

export function start(context: IOServerContext, options: IOOptions) {
  const server = createServer(context, options)
  return server.start()
}
