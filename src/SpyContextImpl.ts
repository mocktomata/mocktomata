import { SpyContext, SpecAction, SpecMode, Plugin, SpyCall } from 'komondor-plugin'

import { SpyInstanceImpl } from './SpyInstanceImpl'
import { SpyCallImpl } from './SpyCallImpl'

export class IdTracker {
  pluginTypes: string[] = []
  getNextId(pluginType: string) {
    return this.pluginTypes[pluginType] = (this.pluginTypes[pluginType] || 0) + 1
  }
}

export class SpyContextImpl implements SpyContext {
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
    this.idTracker = context.idTracker
    this.actions = context.actions || []
    this.instanceId = this.idTracker.getNextId(plugin.type)
  }
  newInstance() {
    return new SpyInstanceImpl(this)
  }
  newCall(): SpyCall {
    return new SpyCallImpl(this, ++this.invokeCount)
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
    const childContext = new SpyContextImpl(
      this,
      this.mode,
      this.specId,
      plugin
    )
    return childContext
  }
  on(actionType: string, name: string, callback) {
    if (!this.events[actionType])
      this.events[actionType] = {}
    if (!this.events[actionType][name])
      this.events[actionType][name] = []
    this.events[actionType][name].push(callback)
  }
  onAny(callback) {
    this.listenAll.push(callback)
  }
}
