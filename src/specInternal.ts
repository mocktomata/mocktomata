import { satisfy } from 'assertron'
import { tersify } from 'tersify'

import { MissingSpecID } from './errors'
import {
  Spec,
  SpecAction,
  SpecMode
} from './interfaces'
import { io } from './io'
import { createSpecStore } from './specStore'
import { komondorUtil } from './plugin'
import { store } from './store'

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

function getMode(id: string, mode: SpecMode) {
  const override = store.specOverrides.find(s => {
    if (typeof s.filter === 'string')
      return s.filter === id
    else
      return s.filter.test(id)
  })
  return override ? override.mode :
    store.specDefaultMode || mode
}

async function createSpec(id, subject, mode) {
  const store = createSpecStore()
  const context = store as any
  context.mode = mode
  context.id = id

  if (!id && mode !== 'live')
    throw new MissingSpecID(mode)

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

export async function specLive(id, subject) {
  if (typeof id !== 'string') {
    subject = id
    id = ''
  }
  const mode = getMode(id, 'live')
  return createSpec(id, subject, mode)
}

export async function specSave<T>(id: string, subject: T): Promise<Spec<T>> {
  const mode = getMode(id, 'save')
  return createSpec(id, subject, mode)
}

export async function specSimulate<T>(id: string, subject: T): Promise<Spec<T>> {
  const mode = getMode(id, 'simulate')
  return createSpec(id, subject, mode)
}
