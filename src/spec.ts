import { satisfy } from 'assertron'
import { Expectation, spy, CallRecord } from 'satisfier'
import { unpartial } from 'unpartial'

import { Spec, SpecOptions } from './interfaces'
import { writers } from './writers'

const defaultSpecOptions = { mode: 'verify' } as SpecOptions

export function spec<T extends Function>(fn: T, options?: SpecOptions): Spec<T> {
  const opt = unpartial(defaultSpecOptions, options)
  const subject = opt.mode === 'replay' ? spy(fn) /*player(fn)*/ : spy(fn)
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
