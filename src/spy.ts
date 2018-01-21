import { FluxStandardAction } from 'flux-standard-action'

import { getReturnSpy } from './returnSpys'
import { createSpecStore } from './specStore';

function spyOnCallback(fn, callbackPath) {
  let callback
  return Object.assign(
    (...args) => {
      callback(callbackPath, ...args)
      fn(...args)
    }, {
      called(cb) {
        callback = cb
      }
    })
}

function spyFunction({ resolve, store }, subject) {
  return function (...args) {
    store.add({
      type: 'invoke',
      payload: args
    })
    const spiedCallbacks: any[] = []
    const spiedArgs = args.map((arg, index) => {
      if (typeof arg === 'function') {
        const spied = spyOnCallback(arg, undefined)
        spiedCallbacks.push(spied)
        return spied
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            const spied = spyOnCallback(arg[key], [index, key])
            spiedCallbacks.push(spied)
            arg[key] = spied
          }
        })
      }
      return arg
    })
    if (spiedCallbacks.length > 0) {
      const waiting = new Promise(a => {
        spiedCallbacks.forEach(s => {
          s.called((callbackPath, ...results) => {
            store.add({
              type: 'callback',
              payload: results,
              meta: callbackPath
            })
            a()
          })
        })
      })
      const result = subject.call(this, ...spiedArgs)
      waiting.then(() => {
        store.add({
          type: 'return',
          payload: result
        })
        resolve()
      }, resolve)
      return result
    }
    else {
      let result
      try {
        result = subject.call(this, ...args)
      }
      catch (err) {
        store.add({
          type: 'throw',
          payload: err
        })
        // resolve instead of reject because it is the call that fails,
        // the spying didn't fail.
        resolve()
        throw err
      }
      const returnSpy = getReturnSpy(result)
      if (returnSpy) {
        return returnSpy({ store, resolve }, result)
      }
      else {
        store.add({ type: 'return', payload: result })
        resolve()
      }
      return result
    }
  }
}

export interface Spy<T> {
  on(event: string, callback: (action: FluxStandardAction<any, any>) => void),
  onAny(callback: (action: FluxStandardAction<any, any>) => void),
  actions: FluxStandardAction<any, any>[],
  completed: Promise<FluxStandardAction<any, any>[]>,
  subject: T
}

export function spy<T>(subject: T): Spy<T> {
  const store = createSpecStore()

  let resolve
  const completed = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(store.actions)
    }
  })
  const spied = spyFunction({ resolve, store }, subject)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    completed,
    subject: spied
  } as any
}
