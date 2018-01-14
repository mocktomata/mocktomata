import { CallRecord } from './CallRecord'
import { CallEntry } from './CallEntry'

export function createCallRecordCreator(args: any[]) {
  let resolve
  let reject
  let invokedCallback
  const p = new Promise((a, r) => {
    resolve = (resolved) => {
      if (resolved) {
        invokedCallback = resolved.key
        a(resolved.results)
      }
      else {
        a()
      }
    }
    reject = r
  })
  const callEntry = Object.assign(p, {
    inputs: args,
    getCallRecord() {
      const inputs = trimCallbacks(callEntry.inputs)
      const { output, error } = callEntry
      return callEntry.then(asyncOutput => {
        const record: any = { inputs, output, error, asyncOutput }
        if (invokedCallback) record.invokedCallback = invokedCallback
        return CallRecord.create(record)
      }, asyncError => {
        const record: any = { inputs, output, error, asyncError }
        if (invokedCallback) record.invokedCallback = invokedCallback
        return CallRecord.create(record)
      })
    }
  }) as CallEntry

  return {
    resolve,
    reject,
    callEntry
  }
}

const callbackLiteral = { tersify() { return 'callback' } }

function trimCallbacks(inputs: any[]) {
  return inputs.map(arg => {
    if (typeof arg === 'function') {
      return callbackLiteral
    }
    if (typeof arg === 'object') {
      Object.keys(arg).forEach(key => {
        if (typeof arg[key] === 'function') {
          arg[key] = callbackLiteral
        }
      })
    }
    return arg
  })
}
