import { SpyCall } from 'komondor-plugin'
import { unpartial } from 'unpartial'

import { unartifactify } from './artifactify'
import { artifactKey } from './constants'
import { plugins } from './plugin';
import { SpyInstanceImpl } from './SpyInstanceImpl'

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
      if (arg === undefined || arg === null) return arg
      if (arg[artifactKey])
        return unartifactify(arg)

      if (Array.isArray(arg)) {
        // assuming there will be no callbacks in array parameters
        return arg
      }

      const plugin = plugins.find(p => p.support(arg))
      if (plugin) {
        const context = this.instance.context.createCallbackContext(plugin, this, [i])
        return plugin.getSpy(context, arg)
      }

      if (typeof arg === 'object') {
        const result = {}
        Object.keys(arg).forEach(key => {
          const prop = arg[key]
          if (typeof prop === 'function') {
            const plugin = plugins.find(p => p.support(prop))!
            const context = this.instance.context.createCallbackContext(plugin, this, [i, key])
            result[key] = plugin.getSpy(context, prop)
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
}
