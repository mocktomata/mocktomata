import WebSocket = require('ws')
import { ClientOptions } from 'ws'

import { SpecContext } from '../index'
import { createFakeClientBase } from './createFakeClientBase'

export function spyWebSocketClient(context: SpecContext, subject: typeof WebSocket): Partial<typeof WebSocket> {
  // return type is Partial<typeof WebSocket> because the implementation is not complete.
  return class WebSocketClientSpy extends createFakeClientBase(subject) {
    constructor(address: string, options?: ClientOptions) {
      super(address, options)

      context.add({
        type: 'ws/constructor',
        payload: [address, options]
      })
    }
    on(event: string, listener) {
      if (event === 'message') {
        const wrapped = (message) => {
          context.add({
            type: 'ws/message',
            payload: message,
            meta: {
              event
            }
          })
          listener(message)
        }
        super.on(event, wrapped)
      }
      else {
        const wrapped = (...args) => {
          context.add({
            type: 'ws/event',
            payload: args,
            meta: {
              event
            }
          })
          listener(...args)
        }
        super.on(event, wrapped)
      }
      return this
    }
    send(message, options?, cb?) {
      context.add({
        type: 'ws/send',
        payload: message
      })
      super.send(message, options, cb)
    }
    terminate() {
      context.add({
        type: 'ws/terminate',
        payload: undefined
      })
      super.terminate()
    }
  }
}
