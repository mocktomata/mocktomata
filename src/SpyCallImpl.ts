import { SpyCall, SpecAction } from 'komondor-plugin'
import { unpartial } from 'unpartial'

import { SpyInstanceImpl } from './SpyInstanceImpl'
import { plugins } from './plugin';

export class SpyCallImpl implements SpyCall {
  constructor(public instance: SpyInstanceImpl, public invokeId: number, public callMeta?: { [k: string]: any }) {
  }
  invoke<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    this.instance.addAction({
      name: 'invoke',
      payload: args,
      meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
      invokeId: this.invokeId
    })

    return args.map((arg, i) => {
      if (Array.isArray(arg)) {
        // assuming there will be no callbacks in array parameters
        return arg
      }

      const plugin = plugins.find(p => p.support(arg))
      if (plugin) {
        const context = this.instance.context.createCallbackContext(plugin, this, [i])
        return plugin.getSpy(context, arg)
      }

      if (typeof arg === 'object' && arg !== null) {
        const result = {}
        Object.keys(arg).forEach(key => {
          const prop = arg[key]
          if (typeof prop === 'function') {
            const plugin = plugins.find(p => p.support(prop))!
            // if (plugin) {
            const context = this.instance.context.createCallbackContext(plugin, this, [i, key])
            result[key] = plugin.getSpy(context, prop)
            // }
            // result[key] = this.spyOnCallback(prop, [i, key])
          }
          else {
            result[key] = prop
          }
        })
        return result
      }

      if (typeof arg === 'function') {
        return this.spyOnCallback(arg, [i])
      }

      return arg
    }) as T
  }
  return<T>(result: T, meta?: { [k: string]: any }): T {
    const action = this.instance.addAction({
      name: 'return',
      payload: result,
      meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
      invokeId: this.invokeId
    })

    return this.instance.addReturnAction(action) || result
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
  spyOnCallback(fn, sourcePath) {
    return (...args) => {
      const action = {
        payload: args,
        sourceInvokeId: this.invokeId,
        sourcePath
      } as SpecAction
      this.instance.addCallbackAction(action)
      fn(...args)
    }
  }
}
