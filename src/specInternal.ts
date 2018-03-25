import { satisfy } from 'assertron'
import { SpecAction, SpecMode, SpyContext, StubContext, ReturnAction } from 'komondor-plugin'
import { tersify } from 'tersify'

import { MissingSpecID, SpecNotFound } from './errors'
import { Spec } from './interfaces'
import { io } from './io'
import { plugins } from './plugin'
import { store } from './store'

// need to wrap because object.assign will fail
export function createSpeclive() {
  return function specLive(id, subject) {
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

export interface SpecStore extends SpyContext, StubContext {
  /**
   * Collected or loaded actions.
   */
  readonly actions: SpecAction[],
  /**
   * String representation of the expectation of the Spec.
   */
  expectation: string,
  /**
   * Save the actions.
   */
  save(id: string),
  /**
   * Load the actions.
   */
  load(id: string)
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
  const actions: SpecAction[] = []
  let actionCounter = 0
  const events = {}
  const listenAll: any[] = []

  const context: SpyContext = {
    mode: 'live',
    specId,
    addReturnAction(type: string, result, meta = {}) {
      const action = fillMetaId(type, { type, payload: result, meta })
      actions.push(action)
      callListeners(action)

      const plugin = plugins.find(p => p.support(result))
      if (plugin) {
        action.meta.returnType = plugin.type
        action.meta.returnId = getNextTypeCounter(plugin.type)
        return plugin.getSpy(context, result, action) || result
      }
      return result
    },
    add(type: string, payload?: any, meta: object = {}) {
      const a = fillMetaId(type, { type, payload, meta })
      actions.push(a)
      callListeners(a)
      return a
    }
  }
  const typesCounter = {}
  function fillMetaId(type, action) {
    action.meta.id = getNextTypeCounter(type)
    return action
  }
  function getNextTypeCounter(type) {
    const counter = typesCounter[type] || 0
    return typesCounter[type] = counter + 1
  }
  function callListeners(action) {
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
  }

  const spied = getSpy(context, subject)

  const spec: Spec<T> = {
    actions,
    subject: spied,
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
      const action = actions[actionCounter]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        const actions = spec.actions
        satisfy(actions, expectation)
      })
    }
  }
  return spec
}
function getSpy(context: SpyContext, subject: any) {
  const plugin = plugins.find(p => {
    return p.support(subject)
  })
  if (plugin) {
    return plugin.getSpy(context, subject, undefined)
  }
}

async function createSavingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  const actions: SpecAction[] = []
  let actionCounter = 0
  const events = {}
  const listenAll: any[] = []

  if (!specId)
    throw new MissingSpecID('save')

  const context: SpyContext = {
    mode: 'live',
    specId,
    add(type: string, payload?: any, meta: object = {}) {
      const a = fillMetaId(type, { type, payload, meta })
      actions.push(a)
      callListeners(a)
      return a
    },
    addReturnAction(type: string, result, meta = {}) {
      const action = fillMetaId(type, { type, payload: result, meta })
      actions.push(action)
      callListeners(action)
      const plugin = plugins.find(p => p.support(result))
      if (plugin) {
        action.meta.returnType = plugin.type
        action.meta.returnId = getNextTypeCounter(plugin.type)
        return plugin.getSpy(context, result, action) || result
      }
      return result
    }
  }

  function callListeners(action) {
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
  }
  const typesCounter = {}

  function fillMetaId(type, action) {
    action.meta.id = getNextTypeCounter(type)
    return action
  }
  function getNextTypeCounter(type) {
    const counter = typesCounter[type] || 0
    return typesCounter[type] = counter + 1
  }

  const spied = getSpy(context, subject)

  const spec: Spec<T> = {
    actions,
    subject: spied,
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
      const action = actions[actionCounter]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        satisfy(actions, expectation)
        // istanbul ignore next
        if (!specId)
          throw new Error('Cannot save spec without options.id.')
        makeErrorSerializable(actions)
        return io.writeSpec(specId, {
          expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
          actions
        })
      })
    }
  }
  return spec
}

async function createStubbingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  if (!specId)
    throw new MissingSpecID('simulate')

  const actions: SpecAction[] = []
  let actionCounter = 0

  const events = {}
  const listenAll: any[] = []

  const context: StubContext = {
    specId,
    getStub: (context, action) => getStub(context, undefined, action),
    peek<A extends SpecAction>(): A | undefined {
      return actions[actionCounter] as any
    },
    next(): void {
      const action = actions[++actionCounter]
      if (action) {
        callListeners(action)
      }
    },
    prune() {
      actions.splice(actionCounter, actions.length - actionCounter)
    },
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
      const action = actions[actionCounter]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    }
  }
  try {
    const specRecord = await io.readSpec(specId)
    actions.splice(0, actions.length, ...specRecord.actions)
  }
  catch (err) {
    throw new SpecNotFound(specId, err)
  }
  const stub = getStub(context, subject, undefined)

  const spec: Spec<T> = {
    actions,
    subject: stub,
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
      const action = actions[actionCounter]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    },
    satisfy(expectation) {
      return Promise.resolve().then(() => {
        const actions = spec.actions
        satisfy(actions, expectation)
      })
    }
  }
  return spec

  function callListeners(action) {
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
  }
}

function getStub(context: StubContext, subject: any, action: ReturnAction | undefined) {
  const plugin = plugins.find(p => (action && action.meta.returnType === p.type) || p.support(subject))
  if (plugin)
    return plugin.getStub(context, subject, action)
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
  return /\/throw/.test(action.type) && action.payload instanceof Error
}

function isRejectErrorPromiseReturnAction(action) {
  return action.type === 'promise/reject' && action.payload instanceof Error
}
