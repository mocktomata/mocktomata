import { SpyCall, SpecAction } from 'komondor-plugin'

import { plugins } from './plugin'
import { SpyContextImpl } from './SpyContextImpl'

export class SpyCallImpl implements SpyCall {
  trigger<T>(_err: T, _meta?: { [k: string]: any; } | undefined): T {
    throw new Error('Method not implemented.');
  }
  constructor(public context: SpyContextImpl, public invokeId: number) {
  }
  invoke<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    const name = 'invoke'

    const type = this.context.plugin.type
    const action = { type, name, payload: args, meta, instanceId: this.context.instanceId, invokeId: this.invokeId } as SpecAction

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
    const action = { type, name, payload: result, meta, instanceId: this.context.instanceId, invokeId: this.invokeId } as SpecAction

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
    const action = { type, name, payload: err, meta, instanceId: this.context.instanceId, invokeId: this.invokeId } as SpecAction

    this.context.actions.push(action)
    this.context.callListeners(action)

    return err
  }
}

function spyOnCallback(call: SpyCallImpl, fn, sourcePath) {
  return (...args) => {
    const action = {
      type: 'komondor',
      name: 'callback',
      payload: args,
      sourceType: call.context.plugin.type,
      sourceInstanceId: call.context.instanceId,
      sourceInvokeId: call.invokeId,
      sourcePath
    } as SpecAction
    call.context.actions.push(action)
    call.context.callListeners(action)
    fn(...args)
  }
}
