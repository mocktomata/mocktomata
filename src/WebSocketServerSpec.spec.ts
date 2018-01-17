import { satisfy } from 'assertron'
import { test } from 'ava'
import { FluxStandardAction } from 'flux-standard-action'
import { unpartial } from 'unpartial'
import WebSocket = require('ws')
import { ServerOptions } from 'ws'

import { SpecOptions, WebSocketSpecRecord } from './interfaces'
import { io } from './io'
import { defaultSpecOptions, getMode } from './SpecOptions'

async function spyWebSocketServer() {
  const actions: FluxStandardAction<any, any>[] = []
  let resolve
  let reject
  let onChangeCallback
  function addAction(action) {
    actions.push(action)
    if (onChangeCallback) {
      onChangeCallback(action, actions)
    }
  }
  const closing = new Promise<FluxStandardAction<any, any>[]>((a, r) => {
    resolve = () => {
      a(actions)
    }
    reject = r
  })
  const subject = class {
    server: WebSocket.Server
    constructor(options: ServerOptions) {
      this.server = new WebSocket.Server(options)
      this.server.on('error', reject)
    }
    on(event: string, callback) {
      if (event === 'connection') {
        const wrapped = (...args) => {
          const ws = args[0]
          ws.on('close', (...args) => {
            addAction({
              type: 'client/close',
              payload: args
            })
          })
          ws.on('message', (...args) => {
            addAction({
              type: 'client/message',
              payload: args
            })
          })
          const origSend = ws.send
          ws.send = function (message) {
            addAction({
              type: 'send',
              payload: message
            })
            origSend.call(ws, message)
          }
          callback(...args)
        }
        // spy on client
        this.server.on(event, wrapped)
      }
      else {
        const wrapped = (...args) => {
          addAction({
            type: event,
            payload: args
          })
          callback(...args)
        }
        this.server.on(event, wrapped)
      }
    }
    close(callback?) {
      addAction({
        type: 'close'
      })
      this.server.close(callback)
      resolve()
    }
  }
  return {
    actions,
    closing,
    onChange(callback) {
      onChangeCallback = callback
    },
    subject
  }
}

export interface WebSocketServerSpec {
  actions: FluxStandardAction<any, any>[],
  subject: WebSocket.Server,
  onChange(callback: (action: FluxStandardAction<any, any>, actions: FluxStandardAction<any, any>[]) => void): void,
  closing: Promise<FluxStandardAction<any, any>[]>
}

async function stubWebSocketServer(id) {
  let specRecord: WebSocketSpecRecord
  try {
    specRecord = await io.readSpec(id)
  }
  catch {
    return spyWebSocketServer()
  }

  const actions: FluxStandardAction<any, any>[] = []
  let resolve
  let reject
  let onChangeCallback
  const closing = new Promise<FluxStandardAction<any, any>[]>((a, r) => {
    resolve = () => {
      a(actions)
    }
    reject = r
  })
  const subject = class {
    constructor(_options: ServerOptions) {
      // what to do?
    }
    on(event: string, _callback) {
      if (event === 'connection') {
        // create a specClient for callback.
        // after callback, start replay
      }
    }
    close(callback?) {
      // send close event?
      if (callback) callback()
      resolve()
    }
  }

  return {
    actions,
    subject,
    onChange(callback) {
      onChangeCallback = callback
    },
    closing
  }

  return spyWebSocketServer()
}
export async function specWebSocketServer(options?: SpecOptions) {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)

  const specBase = mode === 'replay' ? await stubWebSocketServer(opt.id) : await spyWebSocketServer()
  return Object.assign(specBase, {
    satisfy(expectation) {
      return specBase.closing.then(actions => {
        satisfy(actions, expectation)
      })
    }
  })
}

test('sever', async () => {
  const serverSpec = await specWebSocketServer()
  const server = new serverSpec.subject({ port: 8099 })
  let counter = 0
  server.on('connection', function (ws) {
    counter++
    ws.on('close', () => {
      counter--
      if (counter === 0) {
        console.log('server closing')
        server.close()
      }
    })
    ws.on('message', message => {
      console.log(`server: message: ${message}`)
      ws.send(`server received ${message}`)
    })
  })

  const client = new WebSocket('ws://localhost:8099')
  client.on('message', data => {
    console.log('client received', data)
    client.terminate()
  })
  client.on('close', () => {
    console.log('client closed')
  })
  client.on('open', () => {
    console.log('client open')
    client.send('hello')
  })

  await serverSpec.satisfy([{
    type: 'client/message',
    payload: ['hello']
  }, {
    type: 'send',
    payload: 'server received hello'
  }, {
    type: 'client/close'
  }, {
    type: 'close'
  }])
})
