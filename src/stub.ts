import { CallEntry, createCallEntryCreator } from './CallEntry'
import { spy, Spy } from './spy'
import { io } from './io'
import { SpecRecord } from './interfaces';

function inputMatches(a, b: any[]) {
  // istanbul ignore next
  if (b.length !== a.length)
    return false
  let match = true
  for (let i = 0; i < b.length; i++) {
    const value = b[i]
    const valueType = typeof value
    if (valueType === 'function') continue
    if (valueType === 'object') {
      // istanbul ignore next
      if (typeof a !== 'object') {
        match = false
        break
      }

      const va = a[i]
      match = !Object.keys(value).some(k => {
        if (typeof value[k] === 'function') return false
        return value[k] !== va[k]
      })
      if (!match)
        break;
    }
    else if (b[i] !== a[i]) {
      match = false
      break;
    }
  }
  return match
}

function locateCallback(args, callbackPath) {
  if (callbackPath) {
    return callbackPath.reduce((p, v) => {
      return p[v]
    }, args)
  }
  return args.find(arg => typeof arg === 'function')
}

export async function stub<T extends Function>(fn: T, id): Promise<Spy<T>> {
  let specRecord: SpecRecord
  try {
    specRecord = await io.readSpec(id)
  }
  catch {
    return spy(fn)
  }

  let calls: CallEntry[] = []
  let spied: Spy<T>
  const stub = function (...args) {
    const record = specRecord.records.find(r => inputMatches(r.inputs, args))
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
        return Promise.reject(record.asyncError)
      }
      creator.resolve()
      if (record.error)
        throw record.error
      return record.output
    }
    else {
      if (!spied) {
        spied = spy(fn, calls)
      }
      return spied.subject(...args)
    }
  } as any

  return {
    calls,
    subject: stub
  }
}
