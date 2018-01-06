export interface CallRecord {
  arguments: any[],
  result: any,
  error: Error
}

export interface Spy {
  calls: ReadonlyArray<CallRecord>
}

/**
 * Spy on function that uses callback.
 */
export function spy<T extends Function>(fn: T): T & Spy {
  const calls: CallRecord[] = []
  const spiedFn: T = function (...args) {
    const spiedArgs = args.map(a => {
      return typeof a === 'function' ? spy(a) : a
    })
    const call = { arguments: spiedArgs } as CallRecord
    calls.push(call)
    try {
      const result = fn(...spiedArgs)
      call.result = result
      return result
    }
    catch (err) {
      call.error = err
      throw err
    }
  } as any

  return Object.assign(spiedFn, {
    calls
  })
}


export interface AsyncCallRecord extends Promise<any> {
  arguments: any[],
  throws(errback: any): Promise<any>
}

export interface AsyncSpy {
  calls: ReadonlyArray<AsyncCallRecord>
}

/**
 * Spy on function that returns a promise.
 */
export function spyAsync<T extends Function>(fn: T): T & AsyncSpy {
  const calls: AsyncCallRecord[] = []
  const spiedFn: T = function (...args) {
    const call = { arguments: args } as AsyncCallRecord
    calls.push(call)
    const result = fn(...args)
    call.then = (cb, eb) => result.then(cb, eb)
    call.catch = cb => (result.catch(cb))
    call.throws = call.catch
    return result
  } as any

  return Object.assign(spiedFn, {
    calls
  })
}
