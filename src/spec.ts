import { satisfy } from 'assertron'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

import {
  SpecAction,
  SpecOptions,
  // @ts-ignore
  SpecRecord,
  Spec
} from './interfaces'
import { io } from './io';
import { defaultSpecOptions, getMode } from './SpecOptions'
import { spy } from './spy'
import { stub } from './stub'

export function makeErrorSerializable(actions: SpecAction[]) {
  actions.forEach(a => {
    if (isRejectErrorPromiseReturnAction(a) ||
      isErrorThrowAction(a)) {
      a.payload = { message: a.payload.message, ...a.payload }
    }
  })
}

function isErrorThrowAction(action) {
  return /\/throw/.test(action.type) && action.payload instanceof Error
}

function isRejectErrorPromiseReturnAction(action) {
  return /\/return/.test(action.type) && action.meta && action.meta.type === 'promise' && action.meta.meta === 'reject' && action.payload instanceof Error
}

export async function spec<T>(subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)
  const specBase = mode === 'replay' ? await stub(subject, opt.id) : spy(subject)

  return Object.assign(specBase, {
    satisfy(expectation) {
      return specBase.completed.then(actions => {
        satisfy(actions, expectation)
        if (opt.mode === 'save') {
          // istanbul ignore next
          if (!opt.id)
            throw new Error('Cannot save spec without options.id.')
          makeErrorSerializable(actions)
          return io.writeSpec(opt.id, {
            expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
            actions
          })
        }
      })
    }
  })
}
