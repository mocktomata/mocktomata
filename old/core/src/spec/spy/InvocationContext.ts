import { findPlugin } from '@komondor-lab/plugin';
import { unpartial } from 'unpartial';
import { unartifactify } from '../artifactify';
import { artifactKey } from '../constants';
import { Meta } from '../interfaces';
import { ReturnAction, SpecAction } from '../specAction';
// import { CallbackContext } from './CallbackContext';
// import { getSpy } from './getSpy';
import { SpyCall, SpyContext, SpyInstance } from './interfaces';
// import { ReturnValueContext } from './ReturnValueContext';

// naming: Invocation vs Expression vs Statement
// It's where the code is being directly referenced (for value type) or used (for function and classes)
export class InvocationContext implements SpyContext {
  constructor(public context: { actions: SpecAction[], instanceIds: Record<string, number> }, public pluginType: string) {
    context.instanceIds[pluginType] = context.instanceIds[pluginType] || 0
  }

  construct({ args, meta }: { args?: any[], meta?: Meta }): SpyInstance {
    const instanceId = ++this.context.instanceIds[this.pluginType]
    return new Instance(this, instanceId, this.pluginType, args, meta)
  }

  addAction(action: Partial<SpecAction>) {
    const a = unpartial({ plugin: this.pluginType } as SpecAction, action)
    this.context.actions.push(a)
    return a
  }

  addReturnAction(action: Partial<ReturnAction>) {
    const plugin = findPlugin(action.payload)
    if (plugin) {
      // const childContext = new ReturnValueContext(this.context, plugin.name, action)
      // action.returnType = plugin.name
      // return getSpy(childContext, plugin, action.payload)
    }
  }

  protected getNextId(pluginId: string) {
    return ++this.context.instanceIds[pluginId]
  }
}

export class Instance implements SpyInstance {
  invokeCount = 0
  constructor(public invocation: InvocationContext, public instanceId: number, public pluginName: string, args?: any[] | undefined, meta?: Meta | undefined) {
    invocation.context.actions.push({
      name: 'construct',
      plugin: pluginName,
      payload: args,
      meta,
      instanceId
    })
  }
  newCall(callMeta?: Meta): SpyCall {
    return new Call(this, ++this.invokeCount, callMeta)
  }
  addAction(action: Partial<SpecAction>) {
    const a = unpartial({ instanceId: this.instanceId, pluginType: this.invocation.pluginType } as any, action)
    this.invocation.context.actions.push(a)
    return this.invocation.addAction(action)
  }
  addReturnAction(action: Partial<SpecAction>) {
    return this.invocation.addReturnAction(action as any)
  }
}

export class Call implements SpyCall {
  constructor(public instance: Instance, public invokeId: number, public callMeta?: { [k: string]: any }) {
  }
  invoke<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    this.instance.addAction({
      name: 'invoke',
      payload: args,
      meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
      invokeId: this.invokeId
    })

    return args.map((arg, i) => {
      if (arg === undefined || arg === null) return arg
      if (arg[artifactKey])
        return unartifactify(arg)

      if (Array.isArray(arg)) {
        // assuming there will be no callbacks in array parameters
        return arg
      }

      const plugin = findPlugin(arg)
      if (plugin) {
        // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i])
        // return plugin.getSpy(context, arg)
      }

      if (typeof arg === 'object') {
        const result: Record<string | number | symbol, any> = {}
        Object.keys(arg).forEach(key => {
          const prop = arg[key]
          const plugin = findPlugin(prop)
          if (plugin) {
            // const context = new CallbackContext(this.instance.invocation.context, plugin.name, this, [i, key])
            // result[key] = plugin.getSpy(context, prop)
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
    return {} as any
    // const action = this.instance.addAction({
    //   name: 'return',
    //   payload: result,
    //   meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
    //   invokeId: this.invokeId
    // })

    // return this.instance.addReturnAction(action) || result
  }
  throw<T>(err: T, meta?: { [k: string]: any }): T {
    this.instance.addAction({
      name: 'throw',
      payload: err,
      meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
      invokeId: this.invokeId
    })
    return err
  }
}
