import { test } from 'ava'
// import { unpartial } from 'unpartial'
import WebSocket = require('ws')
import { ClientOptions } from 'ws'

import { SpecOptions } from './index'
import { FluxStandardAction } from 'flux-standard-action';
import { callbackify } from 'util';
import { satisfy } from 'assertron';
// import { defaultSpecOptions, getMode } from './SpecOptions'


export type WebSocketConstructor = new (url, options?: ClientOptions) => WebSocket

function spyWebSocket() {
  const actions: FluxStandardAction<any, void>[] = []

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
    webSocket: WebSocket
    constructor(url, options?) {
      this.webSocket = new WebSocket(url, options)
    }
    on(event: string, callback) {
      if (event === 'message') {
        const wrapped = (message) => {
          addAction({
            type: event,
            payload: message
          })
          callback(message)
        }
        this.webSocket.on(event, wrapped)
      }
      else {
        const wrapped = (...args) => {
          addAction({
            type: event,
            payload: args
          })
          callback(...args)
        }
        this.webSocket.on(event, wrapped)
      }
    }
    send(message) {
      addAction({
        type: 'send',
        payload: message
      })
      this.webSocket.send(message)
    }
    terminate() {
      this.webSocket.terminate()
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

export function specWebSocket(_options?: SpecOptions) {
  // const _opt = unpartial(defaultSpecOptions, options)
  // const mode = getMode(opt)

  const specBase = spyWebSocket()

  return Object.assign(specBase, {
    satisfy(expectation) {
      return specBase.closing.then(actions => {
        satisfy(actions, expectation)
      })
    }
  })
}

test('actively closing web socket', async () => {
  const webSocketSpec = specWebSocket()
  const ws = new webSocketSpec.subject('ws://html5rocks.websocket.org/echo')
  ws.on('message', function (data) {
    console.log('Server: ', data)
    ws.terminate()
  })

  ws.on('close', function () {
    console.log('closing connection')
    console.log(arguments)
  })
  ws.on('open', () => {
    ws.send('Ping')
  })

  await webSocketSpec.closing
  console.log(webSocketSpec['actions'])
  await webSocketSpec.satisfy([{
    type: 'open'
  }, {
    type: 'send',
    payload: 'Ping'
  }, {
    type: 'message',
    payload: 'Ping'
  }, {
    type: 'close'
  }])
})
