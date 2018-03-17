import http from 'http'

import { log } from './log'
import { createApp } from './localServer'

require('env2')('.env')

const port = process.env.PORT || 3000
const app = createApp(port)
const server = http.createServer(app)
server.on('error', onError)
server.on('listening', onListening)
server.listen(port)

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') throw error
  let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      log.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      log.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening(): void {
  let addr = server.address()
  log.info(`Listening on port ${addr.port}`)
}
