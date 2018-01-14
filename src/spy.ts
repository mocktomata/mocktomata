import { CallEntry } from './CallEntry'
import { createCallRecordCreator } from './createCallRecordCreator'

export interface Spy<T> {
  calls: ReadonlyArray<CallEntry>,
  /**
   * the spied function.
   */
  fn: T
}

export function spyOnCallback(fn, key) {
  let callback
  return Object.assign(
    (...args) => {
      // callback is always assigned as it is used internally.
      callback(...args)
      fn(...args)
    }, {
      key,
      called(cb) {
        callback = cb
      }
    })
}

/**
 * Spy on function that uses callback.
 */
export function spy<T extends Function>(fn: T): Spy<T> {
  const calls: CallEntry[] = []
  const spied: T = function (...args) {
    const creator = createCallRecordCreator(args)
    calls.push(creator.callEntry)

    const spiedCallbacks: any[] = []
    const spiedArgs = args.map(arg => {
      if (typeof arg === 'function') {
        const spied = spyOnCallback(arg, undefined)
        spiedCallbacks.push(spied)
        return spied
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            const spied = spyOnCallback(arg[key], key)
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
            a({ results, key: s.key })
          })
        })
      }).then(creator.resolve, creator.reject)

      return fn(...spiedArgs)
    }
    else {
      try {
        const result = fn(...args)
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
