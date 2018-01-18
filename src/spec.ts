import { satisfy } from 'assertron'
import {
  // @ts-ignore
  FluxStandardAction
} from 'flux-standard-action'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

import {
  SpecOptions,
  // @ts-ignore
  SpecRecord2,
  Spec
} from './interfaces'
import { io } from './io';
import { defaultSpecOptions, getMode } from './SpecOptions'
import { spy } from './spy'
import { stub } from './stub'

export function makeErrorSerializable(actions: FluxStandardAction<any, any>[]) {
  actions.forEach(a => {
    if (isRejectErrorPromiseReturnAction(a) ||
      isErrorThrowAction(a)) {
      a.payload = { message: a.payload.message, ...a.payload }
    }
  })
}

function isErrorThrowAction(action) {
  return action.type === 'throw' && action.payload instanceof Error
}

function isRejectErrorPromiseReturnAction(action) {
  return action.type === 'return' && action.meta && action.meta.type === 'promise' && action.meta.meta === 'reject' && action.payload instanceof Error
}

export async function spec<T>(subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)
  const specBase = mode === 'replay' ? await stub(subject, opt.id) : spy(subject)

  return Object.assign(specBase, {
    satisfy(expectation) {
      return specBase.closing.then(actions => {
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
