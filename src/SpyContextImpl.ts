import { SpyContext, SpecAction, SpecMode, Plugin, SpyInstance } from 'komondor-plugin'
import { unpartial } from 'unpartial'

import { SpyInstanceImpl } from './SpyInstanceImpl'
import { plugins } from './plugin';
import { SpyCallImpl } from './SpyCallImpl';

export class SpyContextImpl implements SpyContext {
  actions: SpecAction[]
  events: { [type: string]: { [name: string]: ((action) => void)[] } }
  listenAll: ((action) => void)[]
  instanceIds: { [k: string]: number }
  constructor(
    context,
    public mode: SpecMode,
    public specId: string,
    public plugin: Plugin<any>
  ) {
    this.actions = context.actions || []
    this.events = context.events || {}
    this.instanceIds = context.instanceIds || {}
    this.listenAll = context.listenAll || []
  }
  getNextId(pluginType: string) {
    return this.instanceIds[pluginType] = (this.instanceIds[pluginType] || 0) + 1
  }
  newInstance(args, meta): SpyInstance {
    const instanceId = this.getNextId(this.plugin.type)
    const action = {
      name: 'construct',
      payload: args,
      meta,
      instanceId
    }
    this.addAction(action)

    return new SpyInstanceImpl(this, instanceId)
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
      const childContext = this.createReturnContext(plugin, action)
      action.returnType = plugin.type
      return plugin.getSpy(childContext, action.payload)
    }
  }
  addCallbackAction(action: Partial<SpecAction>) {
    const a = unpartial({
      type: 'callback',
      name: 'invoke',
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
  createReturnContext(plugin, returnAction) {
    const returnContext = new SpyContextImpl(
      this,
      this.mode,
      this.specId,
      plugin
    )

    const newInstance = returnContext.newInstance
    returnContext.newInstance = function (args, meta) {
      const instance: SpyInstanceImpl = newInstance.call(returnContext, args, meta)
      returnAction.returnInstanceId = instance.instanceId
      return instance
    }
    return returnContext
  }
  createCallbackContext(plugin, spyCall: SpyCallImpl, sourcePath) {
    const callbackContext = new SpyContextImpl(
      this,
      this.mode,
      this.specId,
      plugin
    )
    callbackContext.newInstance = function (args, meta) {
      const instanceId = this.getNextId(this.plugin.type)
      const action = {
        name: 'construct',
        payload: args,
        meta,
        instanceId,
        sourceType: spyCall.instance.context.plugin.type,
        sourceInstanceId: spyCall.instance.instanceId,
        sourceInvokeId: spyCall.invokeId,
        sourcePath
      }
      this.addAction(action)

      const instance = new SpyInstanceImpl(this, instanceId)
      const newCall = instance.newCall
      instance.newCall = function (...args) {
        const call: SpyCallImpl = newCall.call(instance, ...args)
        call.invoke = function (args, meta) {
          instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
          })

          return args
        }
        return call
      }
      return instance
    }
    return callbackContext
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
