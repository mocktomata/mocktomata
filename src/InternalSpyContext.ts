import { SpyContext, SpecAction, SpecMode, Plugin, SpyCall } from 'komondor-plugin'

import { plugins } from './plugin'

export class IdTracker {
  pluginTypes: string[] = []
  getNextId(pluginType: string) {
    return this.pluginTypes[pluginType] = (this.pluginTypes[pluginType] || 0) + 1
  }
}

function spyOnCallback(call: SpyCallRecorder, fn, sourcePath) {
  return (...args) => {
    const action = {
      type: 'komondor',
      name: 'callback',
      payload: args,
      sourceType: call.context.plugin.type,
      sourceInstanceId: call.context.instanceId,
      sourceInvokeId: call.invokeId,
      sourcePath
    }
    call.context.actions.push(action)
    call.context.callListeners(action)
    fn(...args)
  }
}

class SpyCallRecorder implements SpyCall {
  constructor(public context: InternalSpyContext, public invokeId: number) {
  }
  invoke<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    const name = 'invoke'

    const type = this.context.plugin.type
    const action: SpecAction = { type, name, payload: args, meta, instanceId: this.context.instanceId, invokeId: this.invokeId }

    this.context.actions.push(action)
    this.context.callListeners(action)
    return args.map((arg, i) => {
      if (typeof arg === 'function') {
        return spyOnCallback(
          this,
          arg,
          [i]
        )
      }
      if (typeof arg === 'object' && arg !== null) {
        const result = {}
        Object.keys(arg).forEach(key => {
          const prop = arg[key]
          if (typeof prop === 'function') {
            result[key] = spyOnCallback(
              this,
              prop,
              [i, key]
            )
          }
          else {
            result[key] = prop
          }
        })
        return result
      }

      return arg
    }) as T
  }
  return<T>(result: T, meta?: { [k: string]: any }): T {
    const name = 'return'

    const type = this.context.plugin.type
    const action: SpecAction = { type, name, payload: result, meta, instanceId: this.context.instanceId, invokeId: this.invokeId }

    this.context.actions.push(action)
    this.context.callListeners(action)

    const plugin = plugins.find(p => p.support(result))
    if (plugin) {
      const childContext = this.context.createChildContext(plugin)
      action.returnType = plugin.type
      action.returnInstanceId = childContext.instanceId
      return plugin.getSpy(childContext, result)
    }

    return result
  }
  throw<T>(err: T, meta?: { [k: string]: any }): T {
    const name = 'throw'

    const type = this.context.plugin.type
    const action: SpecAction = { type, name, payload: err, meta, instanceId: this.context.instanceId, invokeId: this.invokeId }

    this.context.actions.push(action)
    this.context.callListeners(action)

    return err
  }
}

export class InternalSpyContext implements SpyContext {
  instanceId: number
  actions: SpecAction[] = []
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
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
  add(type: string, name: string, payload?: any, meta: any = {}) {
    const a = { type, name, payload, meta, instanceId: this.instanceId }

    this.actions.push(a)
    this.callListeners(a)
    return a
  }
  callListeners(action) {
    if (this.events[action.type]) {
      if (this.events[action.type][action.name])
        this.events[action.type][action.name].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
  createChildContext(plugin) {
    const childContext = new InternalSpyContext(
      this,
      this.mode,
      this.specId,
      plugin
    )
    return childContext
  }
}
