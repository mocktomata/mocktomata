import { createSatisfier } from 'satisfier'
import { setImmediate } from 'timers'
import WebSocket = require('ws')
import { ClientOptions } from 'ws'
import { SpecContext, SpecPluginUtil } from '../index'

import { createFakeClientBase } from './createFakeClientBase'
import { spyWebSocketClient } from './spyWebSocketClient'

export function stubWebSocketClient(context: SpecContext, util: SpecPluginUtil, subject: typeof WebSocket, id: string): Partial<typeof WebSocket> {
  return class WebSocketClientStub extends createFakeClientBase(subject) {
    stubBag: any = { listeners: {} }
    constructor(address: string, options?: ClientOptions) {
      super(address, options)
      this.stubBag.ctorArgs = [address, options]

      const action = context.peek()!
      if (!createSatisfier(action.payload).test(JSON.parse(JSON.stringify([address, options])))) {
        this.switchToSpy('constructor')
      }
      else {
        context.next()
        this.emitNextActions()
      }
    }
    emitNextActions() {
      setImmediate(() => {
        const action = context.peek()
        if (!action) return

        if (action.type === 'ws/message') {
          context.next()
          const listeners = this.stubBag.listeners[action.meta.event]
          if (listeners)
            listeners.forEach(l => l(action.payload))

        }
        if (action.type === 'ws/event') {
          context.next()
          const listeners = this.stubBag.listeners[action.meta.event]
          if (listeners)
            listeners.forEach(l => l(...action.payload))
          if (action.meta.event === 'close') {
            context.resolve()
          }
        }
      })
    }
    switchToSpy(currentAction) {
      util.log.warn(`The current action '${currentAction}' does not match with saved record of ${id}. Spying instead.`)
      context.prune()
      this.stubBag.spy = new (spyWebSocketClient(context, subject) as any)(...this.stubBag.ctorArgs)
    }
    on(event: string, listener) {
      if (this.stubBag.spy)
        return this.stubBag.spy.on(event, listener)
      const listeners = this.stubBag.listeners
      if (!listeners[event])
        listeners[event] = []
      listeners[event].push(listener)
      return this
    }
    send(message, options?, cb?) {
      if (this.stubBag.spy)
        return this.stubBag.spy.send(message, options, cb)
      const action = context.peek()
      if (!action || action.type !== 'ws/send' || action.payload !== message) {
        this.switchToSpy('send')
        return this.stubBag.spy.send(message, options, cb)
      }
      context.next()
      this.emitNextActions()
    }
    terminate() {
      if (this.stubBag.spy)
        return this.stubBag.spy.terminate()
      const action = context.peek()
      if (!action || action.type !== 'ws/terminate') {
        this.switchToSpy('terminate')
        return this.stubBag.spy.terminate()
      }
      context.next()
      this.emitNextActions()
    }
  }
}
