import { CallEntry, createCallEntryCreator } from './CallEntry'
import { spy, Spy } from './spy'
import { io } from './io'

function inputMatches(_, _b) {
  return true
}

function locateCallback(args, invokedCallback) {
  if (invokedCallback) {
    return invokedCallback.reduce((p, v) => {
      return p[v]
    }, args)
  }
  return args.find(arg => typeof arg === 'function')
}

export function stub<T extends Function>(fn: T, id): Promise<Spy<T>> {
  return io.readSpec(id).then(specRecord => {
    let calls: CallEntry[] = []
    let spied: Spy<T>
    const stub = function (...args) {
      const record = specRecord.records.find(r => inputMatches(r, args))
      if (record) {
        const creator = createCallEntryCreator(args)
        calls.push(creator.callEntry)
        creator.callEntry.error = record.error
        creator.callEntry.output = record.output

        if (record.asyncOutput) {
          const callback = locateCallback(args, record.callbackPath)
          if (callback) {
            callback(...record.asyncOutput)
            creator.resolve({ results: record.asyncOutput, key: record.callbackPath })
          }
          else {
            creator.resolve({ results: record.asyncOutput })
            return creator.callEntry.output = Promise.resolve(record.asyncOutput)
          }
        }
        if (record.asyncError) {
          creator.reject(record.asyncError)
          return Promise.reject(record.asyncOutput)
        }
        if (record.error) {
          creator.reject()
        }
        creator.resolve()
        return record.output
      }
      else {
        if (!spied) {
          spied = spy(fn)
          calls = spied.calls as CallEntry[]
        }
        return spied.fn(...args)
      }
    } as any

    return {
      calls,
      fn: stub
    }
  })
}
