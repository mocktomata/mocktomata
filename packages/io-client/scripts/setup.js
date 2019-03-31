const tmp = require('tmp');
const io = require('@komondor-lab/io-server')

const dir = tmp.dirSync();
const server = io.createServer({ cwd: dir.name })
global.server = server
module.exports = async () => {
  server.start()

  console.info(`komondor server started: ${server.info.port}`)
}
