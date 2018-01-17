import { satisfy } from 'assertron'
import { Expectation, createSatisfier } from 'satisfier'
import { unpartial } from 'unpartial'

import { CallRecord } from './CallRecord'
import { Spec, SpecOptions } from './interfaces'
import { defaultSpecOptions, getMode } from './SpecOptions'
import { spy } from './spy'
import { stub } from './stub'
import { io } from './io'

export async function spec<T extends Function>(fn: T, options?: SpecOptions): Promise<Spec<T>> {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)

  const specBase = mode === 'replay' ? await stub(fn, opt.id) : spy(fn)
  return Object.assign(specBase, {
    satisfy(expectation: Expectation<CallRecord[]>): Promise<void> {
      return Promise.all(specBase.calls.map(call => call.getCallRecord()))
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
