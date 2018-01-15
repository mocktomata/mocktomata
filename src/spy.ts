import { CallEntry, createCallEntryCreator } from './CallEntry'

export interface Spy<T> {
  calls: ReadonlyArray<CallEntry>,
  /**
   * the spied function.
   */
  fn: T
}

export function spyOnCallback(fn, callbackPath) {
  let callback
  return Object.assign(
    (...args) => {
      // callback is always assigned as it is used internally.
      callback(...args)
      fn(...args)
    }, {
      callbackPath,
      called(cb) {
        callback = cb
      }
    })
}

/**
 * Spy on function that uses callback.
 */
export function spy<T extends Function>(fn: T, calls: CallEntry[] = []): Spy<T> {
  const spied: T = function (...args) {
    const creator = createCallEntryCreator(args)
    calls.push(creator.callEntry)

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
      new Promise(a => {
        spiedCallbacks.forEach(s => {
          s.called((...results) => {
            a({ results, callbackPath: s.callbackPath })
          })
        })
      }).then(creator.resolve, creator.reject)

      return fn.call(this, ...spiedArgs)
    }
    else {
      try {
        const result = fn.call(this, ...args)
        creator.callEntry.output = result
        if (result && typeof result.then === 'function')
          result.then(results => ({ results })).then(creator.resolve, creator.reject)
        else {
          creator.resolve()
        }
        return result
      }
      catch (error) {
        creator.callEntry.error = error
        // just resolve, no need to reject,
        // the error is on `error` property.
        creator.resolve()
        throw error
      }
    }
  } as any

  return {
    calls,
    fn: spied
  }
}
