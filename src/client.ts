import dnode = require('dnode')

export function createClient(port: number, handler) {
  const client = dnode.connect(port)
  client.on('remote', handler)
}
