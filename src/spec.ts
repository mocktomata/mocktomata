import { satisfy } from 'assertron'
import { Expectation, createSatisfier } from 'satisfier'
import { unpartial } from 'unpartial'

import { CallRecord } from './CallRecord'
import { Spec, SpecOptions } from './interfaces'
import { spy } from './spy'
import { store } from './store'
import { stub } from './stub'
import { io } from './io'

const defaultSpecOptions = { mode: 'verify' } as SpecOptions

function getMode(options: SpecOptions) {
  if (store.mode) {
    if (store.spec) {
      if (options.id === store.spec)
        return store.mode
      if (store.spec instanceof RegExp && store.spec.test(options.id))
        return store.mode
      return options.mode
    }
    return store.mode
  }
  return options.mode
}
export async function spec<T extends Function>(fn: T, options?: SpecOptions): Promise<Spec<T>> {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)

  const subject = mode === 'replay' ? await stub(fn, opt.id) : spy(fn)
  return Object.assign(subject, {
    satisfy(expectation: Expectation<CallRecord[]>): Promise<void> {
      return Promise.all(subject.calls.map(call => call.getCallRecord()))
        .then(records => {
          createSatisfier(expectation).exec(records)
          satisfy(records, expectation)
          if (opt.mode === 'save') {
            // istanbul ignore next
            if (!opt.id)
              throw new Error('Cannot save spec without options.id.')
            const write = io.getSpecWriter()
            return write(opt.id, opt.description, {
              expectation,
              records
            })
          }
        })
    }
  })
}
