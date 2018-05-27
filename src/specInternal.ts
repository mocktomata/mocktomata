import { satisfy } from 'assertron'
import { SpecAction, SpecMode } from 'komondor-plugin'
import { tersify } from 'tersify'

import { ActionTracker, createStubContext } from './ActionTracker'
import { MissingSpecID, SpecNotFound, NotSpecable, InvalidID } from './errors'
import { getSpy } from './getSpy'
import { Spec } from './interfaces'
import { io } from './io'
import { plugins } from './plugin'
import { SpyContextImpl } from './SpyContextImpl'
import { store } from './store'
import { makeSerializableActions } from './specAction'

// need to wrap because object.assign will fail
export function createSpeclive() {
  return function specLive(id, subject?) {
    if (typeof id !== 'string') {
      subject = id
      id = ''
    }
    const mode = getMode(id, 'live')
    return createSpec({ io }, id, subject, mode)
  }
}

export function createSpecSave() {
  return function specSave<T>(id: string, subject: T): Promise<Spec<T>> {
    const mode = getMode(id, 'save')
    return createSpec({ io }, id, subject, mode)
  }
}

export function createSpecSimulate() {
  return function specSimulate<T>(id: string, subject: T): Promise<Spec<T>> {
    const mode = getMode(id, 'simulate')
    return createSpec({ io }, id, subject, mode)
  }
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

export async function createSpec({ io }, specId: string, subject, mode: SpecMode) {
  if (InvalidID.isInvalidID(specId)) {
    throw new InvalidID(specId)
  }
  switch (mode) {
    case 'live':
      return createSpyingSpec(specId, subject)
    case 'save':
      return createSavingSpec({ io }, specId, subject)
    case 'simulate':
      return createStubbingSpec({ io }, specId, subject)
  }
}

async function createSpyingSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const context = new SpyContextImpl({}, 'live', id, plugin)

  const spec: Spec<T> = {
    id,
    mode: context.mode,
    actions: context.actions,
    subject: getSpy(context, plugin, subject),
    on(actionType: string, name: string, callback) {
      context.on(actionType, name, callback)
    },
    onAny(callback) {
      context.onAny(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        satisfy(spec.actions, expectation)
      })
    },
    done() {
      return this.satisfy([])
    }
  }
  return spec
}

async function createSavingSpec<T>({ io }, id: string, subject: T): Promise<Spec<T>> {
  if (!id)
    throw new MissingSpecID('save')

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const context = new SpyContextImpl({}, 'save', id, plugin)

  const spec: Spec<T> = {
    id,
    mode: context.mode,
    actions: context.actions,
    subject: getSpy(context, plugin, subject),
    on(actionType: string, name: string, callback) {
      context.on(actionType, name, callback)
    },
    onAny(callback) {
      context.onAny(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        satisfy(context.actions, expectation)
        // istanbul ignore next
        if (!id)
          throw new Error('Cannot save spec without options.id.')

        return io.writeSpec(id, {
          expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
          actions: makeSerializableActions(this.actions)
        })
      })
    },
    done() {
      return this.satisfy([])
    }
  }
  return spec
}

async function createStubbingSpec<T>({ io }, id: string, subject: T): Promise<Spec<T>> {
  if (!id)
    throw new MissingSpecID('simulate')

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions = await loadActions({ io }, id)
  const actionTracker = new ActionTracker(id, actions)
  const context = createStubContext(actionTracker, plugin.type)

  const spec: Spec<T> = {
    id,
    mode: 'simulate',
    actions,
    subject: plugin.getStub(context, subject),
    on(actionType: string, name: string, callback) {
      actionTracker.on(actionType, name, callback)
    },
    onAny(callback) {
      actionTracker.onAny(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        satisfy(spec.actions, expectation)
      })
    },
    done() {
      return this.satisfy([])
    }
  }
  return spec
}

async function loadActions({ io }, specId: string) {
  try {
    const specRecord = await io.readSpec(specId)
    return fixCircularRefs(specRecord.actions)
  }
  catch (err) {
    throw new SpecNotFound(specId, err)
  }
}

function fixCircularRefs(actions: SpecAction[]) {
  const objRefs = []
  return actions.map(action => {
    return { ...action, payload: fixCirRefValue(action.payload, objRefs) }
  })
}

function fixCirRefValue(value, objRefs: object[]) {
  if (Array.isArray(value)) {
    return value.map(p => fixCirRefValue(p, objRefs))
  }
  if (value === undefined || value === null) return value

  const type = typeof value
  if (type === 'object') {
    objRefs.push(value)
    Object.keys(value).forEach(k => value[k] = fixCirRefValue(value[k], objRefs))
    return value
  }
  if (typeof value !== 'string') return value

  const matches = /\[circular:(\d+)\]/.exec(value)
  if (matches) {
    const cirId = parseInt(matches[1], 10)
    return objRefs[cirId]
  }
  return value
}
