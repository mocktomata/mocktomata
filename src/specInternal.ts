import { satisfy } from 'assertron'
import { SpecAction, SpecMode } from 'komondor-plugin'
import { tersify } from 'tersify'

import { MissingSpecID, SpecNotFound, NotSpecable } from './errors'
import { Spec } from './interfaces'
import { io } from './io'
import { plugins } from './plugin'
import { IdTracker, SpyContextImpl } from './SpyContextImpl'
import { store } from './store'
import { StubContextImpl, ActionTracker } from './StubContextImpl'

// need to wrap because object.assign will fail
export function createSpeclive() {
  return function specLive(id, subject?) {
    if (typeof id !== 'string') {
      subject = id
      id = ''
    }
    const mode = getMode(id, 'live')
    return createSpec(id, subject, mode)
  }
}

export function createSpecSave() {
  return function specSave<T>(id: string, subject: T): Promise<Spec<T>> {
    const mode = getMode(id, 'save')
    return createSpec(id, subject, mode)
  }
}

export function createSpecSimulate() {
  return function specSimulate<T>(id: string, subject: T): Promise<Spec<T>> {
    const mode = getMode(id, 'simulate')
    return createSpec(id, subject, mode)
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

async function createSpec(specId: string, subject, mode: SpecMode) {
  switch (mode) {
    case 'live':
      return createSpyingSpec(specId, subject)
    case 'save':
      return createSavingSpec(specId, subject)
    case 'simulate':
      return createStubbingSpec(specId, subject)
  }
}

async function createSpyingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const idTracker = new IdTracker()

  const context = new SpyContextImpl({ idTracker }, 'live', specId, plugin)

  const spec: Spec<T> = {
    actions: context.actions,
    subject: plugin.getSpy(context, subject),
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
    }
  }
  return spec
}

async function createSavingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  if (!specId)
    throw new MissingSpecID('save')

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const idTracker = new IdTracker()

  const context = new SpyContextImpl({ idTracker }, 'save', specId, plugin)

  const spec: Spec<T> = {
    actions: context.actions,
    subject: plugin.getSpy(context, subject),
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
        if (!specId)
          throw new Error('Cannot save spec without options.id.')
        makeErrorSerializable(this.actions)
        return io.writeSpec(specId, {
          expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
          actions: this.actions
        })
      })
    }
  }
  return spec
}

async function createStubbingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  if (!specId)
    throw new MissingSpecID('simulate')

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions = await loadActions(specId)
  const actionTracker = new ActionTracker(actions)
  const contexts = []

  const context = new StubContextImpl({ contexts, actionTracker }, specId, plugin, subject)

  const spec: Spec<T> = {
    actions,
    subject: plugin.getStub(context, subject),
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
    }
  }
  return spec
}

function makeErrorSerializable(actions: SpecAction[]) {
  actions.forEach(a => {
    if (isRejectErrorPromiseReturnAction(a) ||
      isErrorThrowAction(a)) {
      a.payload = { message: a.payload.message, ...a.payload }
    }
  })
}

function isErrorThrowAction(action) {
  return action.payload instanceof Error
  // return /throw/.test(action.name) && action.payload instanceof Error
}

function isRejectErrorPromiseReturnAction(action) {
  return action.payload instanceof Error
  // return action.type === 'promise' && action.name === 'reject' && action.payload instanceof Error
}

async function loadActions(specId: string) {
  try {
    const specRecord = await io.readSpec(specId)
    return specRecord.actions
  }
  catch (err) {
    throw new SpecNotFound(specId, err)
  }
}
