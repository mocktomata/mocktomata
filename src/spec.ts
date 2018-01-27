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
import { createSpecStore } from './specStore'
import { plugin } from './plugin'

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
  return action.type === 'promise' && action.meta.type === 'reject' && action.payload instanceof Error
}

export async function spec<T>(subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const opt = unpartial(defaultSpecOptions, options)
  const mode = getMode(opt)
  const store = createSpecStore()
  const context = store as any
  context.mode = opt.mode
  context.id = opt.id

  if (mode === 'replay') {
    await store.load(opt.id)
    context.subject = plugin.getStub(context, subject, opt.id)
  }
  else {
    context.subject = plugin.getSpy(context, subject)
  }

  return Object.assign(context, {
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        const actions = store.actions
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
