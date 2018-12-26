const createServer = require('../lib/createServer').createServer

const server = createServer({ port: 4123 })
server.start()
