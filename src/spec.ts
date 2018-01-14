import { satisfy } from 'assertron'
import { Expectation } from 'satisfier'
import { unpartial } from 'unpartial'

import { CallEntry } from './CallEntry'
import { CallRecord } from './CallRecord'
import { Spec, SpecOptions } from './interfaces'
import { spy, Spy } from './spy'
import { writers } from './writers'
import { createCallRecordCreator } from './createCallRecordCreator';

const defaultSpecOptions = { mode: 'verify' } as SpecOptions
function inputMatches(_, _b) {
  return true
}

export function stub<T extends Function>(fn: T, id): Spy<T> {
  const reading = writers.readSpec(id)
  let calls: CallEntry[] = []
  let spied: Spy<T>
  const stub = function (...args) {
    // tslint:disable-next-line
    reading
      .then(specRecord => {
        const record = specRecord.records.find(r => inputMatches(r, args))
        if (record) {
          console.log(args)
          const creator = createCallRecordCreator(args)
          calls.push(creator.callEntry)

          if (record.asyncOutput) {
            const callback = args.find(arg => typeof arg === 'function')
            callback(...record.asyncOutput)
            creator.resolve({ results: record.asyncOutput, key: record.invokedCallback })
          }
          if (record.asyncError) {
            creator.reject(record.asyncError)
          }
          if (record.error)
            throw new Error(record.error.message)
          // todo: promise...
          return record.output

          // const spiedCallbacks: any[] = []
          // const spiedArgs = args.map(arg => {
          //   if (typeof arg === 'function') {
          //     const spied = spyOnCallback(arg, undefined)
          //     spiedCallbacks.push(spied)
          //     return spied
          //   }
          //   if (typeof arg === 'object') {
          //     Object.keys(arg).forEach(key => {
          //       if (typeof arg[key] === 'function') {
          //         const spied = spyOnCallback(arg[key], key)
          //         spiedCallbacks.push(spied)
          //         arg[key] = spied
          //       }
          //     })
          //   }
          //   return arg
          // })
          // if (spiedCallbacks.length > 0) {
          //   new Promise(a => {
          //     spiedCallbacks.forEach(s => {
          //       s.called((...results) => {
          //         a({ results, key: s.key })
          //       })
          //     })
          //   }).then(creator.resolve, creator.reject)

          //   return fn(...spiedArgs)
          // }
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
