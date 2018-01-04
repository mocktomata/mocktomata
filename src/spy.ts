export interface Spy {
  calls: ReadonlyArray<CallRecord>
}

export interface CallRecord {

  arguments: any[],
  result?: any,
  error?: Error
}

export function spy<T extends Function>(fn: T): T & Spy {
  const calls: CallRecord[] = []
  const spiedFn: T = function (...args) {
    const spiedArgs = args.map(a => {
      return typeof a === 'function' ? spy(a) : a
    })
    const call: CallRecord = { arguments: spiedArgs }
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
