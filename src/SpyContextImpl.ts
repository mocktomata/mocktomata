import { SpyContext, SpecAction, SpecMode, Plugin, SpyInstance } from 'komondor-plugin'
import { unpartial } from 'unpartial'

import { SpyInstanceImpl } from './SpyInstanceImpl'
import { plugins } from './plugin';

export class IdTracker {
  pluginTypes: string[] = []
  getNextId(pluginType: string) {
    return this.pluginTypes[pluginType] = (this.pluginTypes[pluginType] || 0) + 1
  }
}

export class SpyContextImpl implements SpyContext {
  actions: SpecAction[]
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  idTracker: IdTracker
  instanceIds: { [k: string]: number }
  constructor(
    context,
    public mode: SpecMode,
    public specId: string,
    public plugin: Plugin<any>
  ) {
    this.idTracker = context.idTracker
    this.actions = context.actions || []
    this.instanceIds = context.instanceIds || {}
  }
  getNextId(pluginType: string) {
    return this.instanceIds[pluginType] = (this.instanceIds[pluginType] || 0) + 1
  }
  newInstance(args, meta): SpyInstance {
    return new SpyInstanceImpl(this, args, meta)
  }
  addAction(action: Partial<SpecAction>) {
    const a = unpartial({
      type: this.plugin.type
    } as SpecAction, action)
    this.actions.push(a)
    this.callListeners(a)
    return a
  }
  addReturnAction(action: Partial<SpecAction>) {
    const plugin = plugins.find(p => p.support(action.payload))
    if (plugin) {
      const childContext = this.createChildContext(plugin, action)
      action.returnType = plugin.type
      // action.returnInstanceId = childContext.instanceId
      return plugin.getSpy(childContext, action.payload)
    }
  }
  addCallbackAction(action: Partial<SpecAction>) {
    const a = unpartial({
      type: 'komondor',
      name: 'callback',
      sourceType: this.plugin.type
    } as SpecAction, action)
    this.addAction(a)
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
  createChildContext(plugin, returnAction) {
    const childContext = new SpyContextImpl(
      this,
      this.mode,
      this.specId,
      plugin
    )

    childContext.newInstance = function (args, meta) {
      const instance = new SpyInstanceImpl(this, args, meta)
      returnAction.returnInstanceId = instance.instanceId
      return instance
    }
    // on new instance?, add the returnInstanceId.
    // childContext.returnAction = returnAction
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
