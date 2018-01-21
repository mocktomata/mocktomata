import { FluxStandardAction } from 'flux-standard-action'
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
function isChildProcess(result) {
  return typeof result.on === 'function' &&
    result.stdout && typeof result.stdout.on === 'function' &&
    result.stderr && typeof result.stderr.on === 'function'
}

function spyOnEventHandler({ store }, subject, methodName, site: string[]) {
  const returnSite = [...site, methodName]
  const fn = subject[methodName]
  subject[methodName] = function (event, cb) {
    const wrap = (...args) => {
      store.add({
        type: 'callback',
        payload: args,
        meta: {
          site: returnSite,
          event
        }
      })
      cb(...args)
    }
    return fn.call(subject, event, wrap)
  }
}

function spyChildProcess({ store }, subject) {
  spyOnEventHandler({ store }, subject, 'on', ['return'])
  spyOnEventHandler({ store }, subject.stdout, 'on', ['return', 'stdout'])
  spyOnEventHandler({ store }, subject.stderr, 'on', ['return', 'stderr'])
  return { type: 'childProcess' }
}
function spyOnResult({ store }, result) {
  if (isChildProcess(result))
    return spyChildProcess({ store }, result)
  return undefined
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
      if (result && typeof result.then === 'function') {
        result.then(
          results => ({ type: 'resolve', payload: results }),
          err => ({ type: 'reject', payload: err })
        ).then(action => {
          store.add({
            type: 'return',
            payload: action.payload,
            meta: { type: 'promise', meta: action.type }
          })
        }).then(() => resolve())
        return result
      }

      if (typeof result === 'object') {
        const meta = spyOnResult({ store }, result)
        store.add({ type: 'return', payload: result, meta })
      }
      else {
        store.add({ type: 'return', payload: result })
      }
      resolve()
      return result
    }
  }
}

export interface Spy<T> {
  on(event: string, callback: (action: FluxStandardAction<any, any>) => void),
  onAny(callback: (action: FluxStandardAction<any, any>) => void),
  actions: FluxStandardAction<any, any>[],
  closing: Promise<FluxStandardAction<any, any>[]>,
  subject: T
}

export function spy<T>(subject: T): Spy<T> {
  const store = createSpecStore()

  let resolve
  const closing = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(store.actions)
    }
  })
  const spied = spyFunction({ resolve, store }, subject)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    closing,
    subject: spied
  } as any
}
