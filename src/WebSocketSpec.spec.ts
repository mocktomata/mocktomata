import { satisfy } from 'assertron'
import { test } from 'ava'
// import { unpartial } from 'unpartial'
import WebSocket = require('ws')
import { ClientOptions } from 'ws'

import { SpecOptions, SpecAction } from './interfaces'
// import { defaultSpecOptions, getMode } from './SpecOptions'


export type WebSocketConstructor = new (url, options?: ClientOptions) => WebSocket

function spyWebSocket() {
  const actions: SpecAction[] = []

  let resolve
  let onChangeCallback
  function addAction(action) {
    actions.push(action)
    if (onChangeCallback) {
      onChangeCallback(action, actions)
    }
  }

  const closing = new Promise<SpecAction[]>(a => {
    resolve = () => {
      a(actions)
    }
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

test.skip('actively closing web socket', async () => {
  const webSocketSpec = specWebSocket()
  const ws = new webSocketSpec.subject('ws://html5rocks.websocket.org/echo')
  ws.on('message', function (data) {
    console.log('Server: ', data)
    ws.terminate()
  })

  ws.on('close', function () {
    console.log('closing connection')
  })
  ws.on('open', () => {
    ws.send('Ping')
  })

  // const recordShouldBe = {
  //   id: 'websocket',
  //   description: 'some description',
  //   actions: [
  //     { type: 'open', payload: [] },
  //     { type: 'send', payload: 'Ping', meta: 'input' },
  //     { type: 'message', payload: 'Ping' },
  //     { type: 'terminate', payload: [], meta: 'input' },
  //     { type: 'close', payload: [1006, ''] }
  //   ]
  // }

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
