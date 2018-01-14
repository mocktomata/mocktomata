import { satisfy } from 'assertron'
import { Expectation, createSatisfier } from 'satisfier'
import { unpartial } from 'unpartial'

import { CallEntry, createCallEntryCreator } from './CallEntry'
import { CallRecord } from './CallRecord'
import { Spec, SpecOptions } from './interfaces'
import { spy, Spy } from './spy'
import { writers } from './writers'

const defaultSpecOptions = { mode: 'verify' } as SpecOptions
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

export function stub<T extends Function>(fn: T, id): Spy<T> {
  const reading = writers.readSpec(id)
  let calls: CallEntry[] = []
  let spied: Spy<T>
  const stub = function (...args) {
    // tslint:disable-next-line
    return reading
      .then(specRecord => {
        const record = specRecord.records.find(r => inputMatches(r, args))
        if (record) {
          const creator = createCallEntryCreator(args)
          calls.push(creator.callEntry)

          if (record.asyncOutput) {
            const callback = locateCallback(args, record.callbackPath)
            if (callback) {
              callback(...record.asyncOutput)
              creator.resolve({ results: record.asyncOutput, key: record.callbackPath })
            }
            else {
              creator.resolve({ results: record.asyncOutput })
              return record.asyncOutput
            }
          }
          if (record.asyncError) {
            creator.reject(record.asyncError)
            throw record.asyncError
          }
          if (record.error)
            throw new Error(record.error.message)
          return record.output
        }
        else {
          if (!spied) {
            spied = spy(fn)
            calls = spied.calls as CallEntry[]
          }
          return spied.fn(...args)
        }
      })
  } as any

  return {
    calls,
    fn: stub
  }
}

export function spec<T extends Function>(fn: T, options?: SpecOptions): Spec<T> {
  const opt = unpartial(defaultSpecOptions, options)

  const subject = opt.mode === 'replay' ? stub(fn, opt.id) : spy(fn)
  return Object.assign(subject, {
    satisfy(expectation: Expectation<CallRecord[]>): Promise<void> {
      return Promise.all(subject.calls.map(call => call.getCallRecord()))
        .then(records => {
          createSatisfier(expectation).exec(records)
          satisfy(records, expectation)
          if (opt.mode === 'save') {
            if (!opt.id)
              throw new Error('Cannot save spec without options.id.')
            const write = writers.getSpecWriter()
            return write(opt.id, opt.description, {
              expectation,
              records
            })
          }
        })
    }
  })
}
