import { FluxStandardAction } from 'flux-standard-action'

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

function spyFunction({ resolve, addAction }, subject) {
  return function (...args) {
    addAction({
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
            addAction({
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
        addAction({
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
        addAction({
          type: 'throw',
          payload: err
        })
        // resolve instead of reject because it is the call that fails,
        // the spying didn't fail.
        resolve()
        throw err
      }
      if (result && typeof result.then === 'function') {
        result.then(
          results => ({ type: 'resolve', payload: results }),
          err => ({ type: 'reject', payload: err })
        ).then(action => {
          // addAction(action)
          addAction({
            type: 'return',
            payload: action.payload,
            meta: { type: 'promise', meta: action.type }
          })
        }).then(() => resolve())
      }
      else {
        addAction({
          type: 'return',
          payload: result
        })
        resolve()
      }
      return result
    }
  }
}

export interface Spy<T> {
  actions: FluxStandardAction<any, any>[];
  closing: Promise<FluxStandardAction<any, any>[]>;
  subject: T;
}

export function spy<T>(subject: T): Spy<T> {
  const actions: FluxStandardAction<any, any>[] = []
  function addAction(action) {
    actions.push(action)
  }
  let resolve
  const closing = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(actions)
    }
  })
  const spied = spyFunction({ resolve, addAction }, subject)

  return {
    actions,
    closing,
    subject: spied
  } as any
}
