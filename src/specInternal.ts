import { satisfy } from 'assertron'
import { SpecAction, SpecMode, SpyContext, StubContext, SpyCall, Plugin } from 'komondor-plugin'
import { tersify } from 'tersify'

import { MissingSpecID, SpecNotFound, NotSpecable } from './errors'
import { Spec } from './interfaces'
import { io } from './io'
import { plugins } from './plugin'
import { store } from './store'


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

class SpyCallRecorder implements SpyCall {
  constructor(public context: SpyInternalContext, public invokeId: number) {
  }
  invoke<T extends any[]>(args: T, name: string =
    'invoke'): T {
    const type = `${this.context.plugin.type}/${name}`
    const action: SpecAction = {
      type, payload: args, meta: { id: this.context.id, invokeId: this.invokeId }
    }

    if (this.context.sourceType) {
      action.meta.sourceType = this.context.sourceType
      action.meta.sourceId = this.context.sourceId
      action.meta.sourcePath = this.context.sourcePath
    }

    this.context.actions.push(action)
    this.context.callListeners(action)
    return args.map((arg, i) => {
      const plugin = plugins.find(p => p.support(arg))
      if (plugin) {
        const childContext = this.context.createChildContext(plugin, i)
        return plugin.getSpy(childContext, arg, action) || arg
      }

      return arg
    }) as T
  }
  return<T>(result: T, name = 'return'): T {
    const type = `${this.context.plugin.type}/${name}`
    const action: SpecAction = {
      type, payload: result, meta: { id: this.context.id, invokeId: this.invokeId }
    }

    this.context.actions.push(action)
    this.context.callListeners(action)

    const plugin = plugins.find(p => p.support(result))
    if (plugin) {
      const childContext = this.context.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.id
      return plugin.getSpy(childContext, result, action) || result
    }

    return result
  }
  throw<T>(err: T, name?: string | undefined): T {
    const type = `${this.context.plugin.type}/${name}`
    const action: SpecAction = {
      type, payload: err, meta: { id: this.context.id }
    }

    this.context.actions.push(action)
    this.context.callListeners(action)

    const plugin = plugins.find(p => p.support(err))
    if (plugin) {
      const childContext = this.context.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.id
      return plugin.getSpy(childContext, err, action) || err
    }

    return err
  }
  callListeners(action) {
    if (this.context.events[action.type]) {
      this.context.events[action.type].forEach(cb => cb(action))
    }
    if (this.context.listenAll.length > 0) {
      this.context.listenAll.forEach(cb => cb(action))
    }
  }
}

class SpyInternalContext {
  id: number
  sourceType: string
  actions: SpecAction[] = []
  events: { [k: string]: ((action) => void)[] } = {}
  listenAll: ((action) => void)[] = []
  types = {}
  sourceId: number
  sourcePath: (string | number)[] = []
  idTracker: IdTracker
  invokeCount = 0
  constructor(
    context,
    public mode: SpecMode,
    public specId: string,
    public plugin: Plugin<any>
  ) {
    this.actions = context.actions
    this.events = context.events
    this.listenAll = context.listenAll
    this.idTracker = context.idTracker
    this.id = this.idTracker.getNextId(plugin.type)
  }
  newCall() {
    return new SpyCallRecorder(this, ++this.invokeCount)
  }
  getSpy(subject, key) {
    const plugin = plugins.find(p => p.support(subject))
    if (plugin) {
      const childContext = this.createChildContext(plugin, key)
      return plugin.getSpy(childContext, subject, undefined)
    }
  }
  addInvokeAction<T extends any[]>(type: string, args: T, meta: any = {}): T {
    const action = {
      type, payload: args, meta: { ...meta, id: this.id }
    }

    if (this.sourceType) {
      action.meta.sourceType = this.sourceType
      action.meta.sourceId = this.sourceId
      action.meta.sourcePath = this.sourcePath
    }

    this.actions.push(action)
    this.callListeners(action)
    return args.map((arg, i) => {
      const plugin = plugins.find(p => p.support(arg))
      if (plugin) {
        const childContext = this.createChildContext(plugin, i)
        return plugin.getSpy(childContext, arg, action) || arg
      }

      return arg
    }) as T
  }
  addReturnAction(type: string, result, meta: any = {}) {
    const action = {
      type, payload: result, meta: { ...meta, id: this.id }
    }

    this.actions.push(action)
    this.callListeners(action)

    const plugin = plugins.find(p => p.support(result))
    if (plugin) {
      const childContext = this.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.id
      return plugin.getSpy(childContext, result, action) || result
    }

    return result
  }
  add(type: string, payload?: any, meta: any = {}) {
    const a = { type, payload, meta: { ...meta, id: this.id } }

    this.actions.push(a)
    this.callListeners(a)
    return a
  }
  callListeners(action) {
    if (this.events[action.type]) {
      this.events[action.type].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
  createChildContext(plugin, key?) {
    const childContext = new SpyInternalContext(
      this,
      this.mode,
      this.specId,
      plugin
    )
    childContext.sourceId = this.id
    childContext.sourceType = plugin.type
    childContext.sourcePath = key !== undefined ? [...this.sourcePath, key] : this.sourcePath
    return childContext
  }
}

class IdTracker {
  pluginTypes: string[] = []
  getNextId(pluginType: string) {
    return this.pluginTypes[pluginType] = (this.pluginTypes[pluginType] || 0) + 1
  }
}

async function createSpyingSpec<T>(specId: string, subject: T): Promise<Spec<T>> {
  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const idTracker = new IdTracker()
  const actions: SpecAction[] = []
  const events: { [k: string]: ((action) => void)[] } = {}
  const listenAll: ((action) => void)[] = []

  const spyContext = new SpyInternalContext({ idTracker, actions, events, listenAll }, 'live', specId, plugin)

  const spec: Spec<T> = {
    actions,
    subject: plugin.getSpy(spyContext, subject, undefined),
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

  const idTracker = new IdTracker()
  const actions: SpecAction[] = []
  const events: { [k: string]: ((action) => void)[] } = {}
  const listenAll: ((action) => void)[] = []

  const spyContext = new SpyInternalContext({ idTracker, actions, events, listenAll }, 'save', specId, plugin)

  const spec: Spec<T> = {
    actions,
    subject: plugin.getSpy(spyContext, subject, undefined),
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
