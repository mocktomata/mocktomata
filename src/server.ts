import dnode = require('dnode')
import fs = require('fs')
import getPort = require('get-port')
// import loki = require('lokijs')

const tempFile = `.boundspec.tmp`

function readTempConfig() {
  if (!fs.existsSync(tempFile)) return undefined

  return JSON.parse(fs.readFileSync(tempFile, 'utf8'))
}

function saveTempConfig(config) {
  fs.writeFileSync(tempFile, JSON.stringify(config))
}

function getLastPort() {
  const tmp = readTempConfig()
  return tmp && tmp.port
}

function saveLastPort(port) {
  const tmp = readTempConfig() || {}
  tmp.port = port
  saveTempConfig(tmp)
}

function startServer(port) {
  // const db = new loki(``)

  const server = dnode({
    isBoundSpec(cb) {
      cb(true)
    },
    load(_id: string) {
      return
    },
    save(_id: string, _records) {
      return
    }
  })
  server.listen(port)
  console.log(`listening on port ${port}`)
  saveLastPort(port)
  return port
}

function isBoundSpecServer(port) {
  return new Promise(a => {
    const client = dnode.connect(port)
    client.on('remote', remote => {
      if (typeof remote.isBoundSpec !== 'function')
        a(false)
      remote.isBoundSpec(is => a(is))
    })
  })
}
/**
 * Starts a server and return the port number.
 * If the server is already started, just return the port number.
 */
export async function start(): Promise<number> {
  const port = getLastPort()
  if (port !== undefined) {
    return getPort({ port }).then(p => {
      if (p !== port) {
        // port is in use
        return isBoundSpecServer(p)
          .then(isBoundSpec => isBoundSpec ? p : startServer(p))
      }
      return startServer(p)
    })
  }
  else {
    return getPort().then(startServer)
  }
}
