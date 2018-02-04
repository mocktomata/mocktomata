import { satisfy } from 'assertron'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

import {
  SpecAction,
  // @ts-ignore
  SpecRecord,
  Spec
} from './interfaces'
import { io } from './io';
import { defaultSpecOptions, getMode } from './SpecOptions'
import { createSpecStore } from './specStore'
import { komondorUtil } from './plugin'

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
  return action.type === 'promise' && action.meta.status === 'reject' && action.payload instanceof Error
}

export interface SpecFn {
  <T>(id: string, subject: T): Promise<Spec<T>>
  <T>(subject: T): Promise<Spec<T>>
  save<T>(id: string, subject: T): Promise<Spec<T>>
  simulate<T>(id: string, subject: T): Promise<Spec<T>>
}

export const spec: SpecFn = Object.assign(
  async function spec(id, subject) {
    if (typeof id !== 'string') {
      subject = id
      id = ''
    }
    const opt = unpartial(defaultSpecOptions, { id, mode: 'verify' })
    const mode = getMode(opt)
    return createSpec(opt.id, subject, mode)
  },
  {
    async save<T>(id: string, subject: T): Promise<Spec<T>> {
      const mode = getMode({ id, mode: 'save' })
      return createSpec(id, subject, mode)
    },
    async simulate<T>(id: string, subject: T): Promise<Spec<T>> {
      const mode = getMode({ id, mode: 'simulate' })
      return createSpec(id, subject, mode)
    }
  }) as any

async function createSpec(id, subject, mode) {
  const store = createSpecStore()
  const context = store as any
  context.mode = mode
  context.id = id

  if (mode === 'simulate') {
    await store.load(id)
    context.subject = komondorUtil.getStub(context, subject, id)
  }
  else {
    context.subject = komondorUtil.getSpy(context, subject)
  }

  return Object.assign(context, {
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        const actions = store.actions
        satisfy(actions, expectation)
        if (mode === 'save') {
          // istanbul ignore next
          if (!id)
            throw new Error('Cannot save spec without options.id.')
          makeErrorSerializable(actions)
          return io.writeSpec(id, {
            expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
            actions
          })
        }
      })
    }
  })
}
