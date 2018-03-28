import { SpyContext, SpecAction, SpecMode, Plugin, SpyCall } from 'komondor-plugin'

import { plugins } from './plugin'

export class IdTracker {
  pluginTypes: string[] = []
  getNextId(pluginType: string) {
    return this.pluginTypes[pluginType] = (this.pluginTypes[pluginType] || 0) + 1
  }
}

class SpyCallRecorder implements SpyCall {
  constructor(public context: InternalSpyContext, public invokeId: number) {
  }
  invoke<T extends any[]>(args: T, name: string =
    'invoke'): T {
    const type = `${this.context.plugin.type}/${name}`
    const action: SpecAction = {
      type, payload: args, meta: { instanceId: this.context.instanceId, invokeId: this.invokeId }
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
      type, payload: result, meta: { instanceId: this.context.instanceId, invokeId: this.invokeId }
    }

    this.context.actions.push(action)
    this.context.callListeners(action)

    const plugin = plugins.find(p => p.support(result))
    if (plugin) {
      const childContext = this.context.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.instanceId
      return plugin.getSpy(childContext, result, action) || result
    }

    return result
  }
  throw<T>(err: T, name?: string | undefined): T {
    const type = `${this.context.plugin.type}/${name}`
    const action: SpecAction = {
      type, payload: err, meta: { instanceId: this.context.instanceId }
    }

    this.context.actions.push(action)
    this.context.callListeners(action)

    const plugin = plugins.find(p => p.support(err))
    if (plugin) {
      const childContext = this.context.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.instanceId
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

export class InternalSpyContext implements SpyContext {
  instanceId: number
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
    this.instanceId = this.idTracker.getNextId(plugin.type)
  }
  newCall(): SpyCall {
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
      type, payload: args, meta: { ...meta, id: this.instanceId }
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
      type, payload: result, meta: { ...meta, id: this.instanceId }
    }

    this.actions.push(action)
    this.callListeners(action)

    const plugin = plugins.find(p => p.support(result))
    if (plugin) {
      const childContext = this.createChildContext(plugin)
      action.meta.returnType = plugin.type
      action.meta.returnId = childContext.instanceId
      return plugin.getSpy(childContext, result, action) || result
    }

    return result
  }
  add(type: string, payload?: any, meta: any = {}) {
    const a = { type, payload, meta: { ...meta, id: this.instanceId } }

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
    const childContext = new InternalSpyContext(
      this,
      this.mode,
      this.specId,
      plugin
    )
    childContext.sourceId = this.instanceId
    childContext.sourceType = plugin.type
    childContext.sourcePath = key !== undefined ? [...this.sourcePath, key] : this.sourcePath
    return childContext
  }
}
