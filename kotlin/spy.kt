package spy
interface Error {
  var name: String
  var message: String
}
interface CallRecord {
  var arguments: Array<Any>
  var result: Any
  var error: Error
}

interface Spy {
  var calls: Array<CallRecord>
}

/**
 * Spy on function that uses callback.
 */
fun spy<T super Function>(fn: T): T & Spy {
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


interface AsyncCallRecord extends Promise<any> {
  arguments: any[],
  throws(errback: any): Promise<any>
}

interface AsyncSpy {
  calls: ReadonlyArray<AsyncCallRecord>
}

/**
 * Spy on function that returns a promise.
 */
fun spyAsync<T extends Function>(fn: T): T & AsyncSpy {
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
