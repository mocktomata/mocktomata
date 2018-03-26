import { satisfy } from 'assertron'
import { SpecAction, SpecMode, SpyContext, StubContext } from 'komondor-plugin'
import { tersify } from 'tersify'

import { MissingSpecID, SpecNotFound, NotSpecable } from './errors'
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
interface SpyInternalContext {
  actions: SpecAction[],
  events: { [k: string]: ((action) => void)[] },
  listenAll: ((action) => void)[]
}

async function createSpyingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions: SpecAction[] = []
  const events: { [k: string]: ((action) => void)[] } = {}
  const listenAll: ((action) => void)[] = []

  const context = createSpyContext({ actions, events, listenAll }, 'live', specId, plugin)

  const spec: Spec<T> = {
    actions,
    subject: plugin.getSpy(context, subject, undefined),
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
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

async function createSavingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  if (!specId)
    throw new MissingSpecID('save')

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions: SpecAction[] = []
  const events: { [k: string]: ((action) => void)[] } = {}
  const listenAll: ((action) => void)[] = []

  const context = createSpyContext({ actions, events, listenAll }, 'save', specId, plugin)

  const spec: Spec<T> = {
    actions,
    subject: plugin.getSpy(context, subject, undefined),
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
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

  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions: SpecAction[] = []
  const events: { [k: string]: ((action) => void)[] } = {}
  const listenAll: ((action) => void)[] = []
  let actionCounter = 0

  try {
    const specRecord = await io.readSpec(specId)
    actions.splice(0, actions.length, ...specRecord.actions)
  }
  catch (err) {
    throw new SpecNotFound(specId, err)
  }

  const context: StubContext = {
    specId,
    getStub(context, action) {
      const plugin = plugins.find(p => action && action.meta.returnType === p.type)
      if (plugin)
        return plugin.getStub(context, subject, action)
    },
    peek<A extends SpecAction>(): A | undefined {
      return actions[actionCounter] as any
    },
    next(): void {
      const action = actions[++actionCounter]
      if (action) {
        callListeners(action)
      }
    },
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
    },
    onAny(callback) {
      listenAll.push(callback)
    }
  }

  const stub = plugin.getStub(context, subject, undefined)

  const spec: Spec<T> = {
    actions,
    subject: stub,
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)

      if (actionCounter === 0 && actions[0].type === actionType) {
        callback(actions[0])
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

class TypeCounter {
  types = {}
  next(type) {
    return this.types[type] = (this.types[type] || 0) + 1
  }
}

function createSpyContext({ actions, events, listenAll }: SpyInternalContext, mode: SpecMode, specId: string, plugin): SpyContext {

  const typeCounter = new TypeCounter()

  const spyId = typeCounter.next(plugin.type)

  const context: SpyContext = {
    mode,
    specId,
    getSpy(subject, meta: any = { sourcePath: [] }) {
      if (typeof subject === 'object') {
        Object.keys(subject).forEach(key => {
          subject[key] = context.getSpy(subject[key], { ...meta, sourcePath: [...meta.sourcePath, key] })
        })
        return subject
      }
      else {
        const plugin = plugins.find(p => p.support(subject))
        if (plugin) {
          return plugin.getSpy(context, subject, undefined) || subject
        }
      }
    },
    addInvokeAction<T extends any[]>(type: string, args: T, meta: any = {}): T {
      const action = { type, payload: args, meta }
      action.meta.id = spyId

      return args.map(arg => {
        const plugin = plugins.find(p => p.support(arg))
        if (plugin) {
          return plugin.getSpy(context, arg, action) || arg
        }

        return arg
      }) as T
    },
    addReturnAction(type: string, result, meta: any = {}) {
      const action = { type, payload: result, meta }
      action.meta.id = spyId

      actions.push(action)
      callListeners(action)

      const plugin = plugins.find(p => p.support(result))
      if (plugin) {
        action.meta.returnType = plugin.type
        action.meta.returnId = typeCounter.next(plugin.type)
        return plugin.getSpy(context, result, action) || result
      }
      return result
    },
    add(type: string, payload?: any, meta: any = {}) {
      const a = { type, payload, meta }
      a.meta.id = spyId

      actions.push(a)
      callListeners(a)
      return a
    }
  }

  return context

  function callListeners(action) {
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
  }
}
