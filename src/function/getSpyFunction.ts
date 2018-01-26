import { SpecPluginUtil, SpecContext } from '../index'

function spyOnCallback(context: SpecContext, fn, callbackPath) {
  return (...args) => {
    context.add({
      type: 'fn/callback',
      payload: args,
      meta: callbackPath
    })
    fn(...args)
  }
}

export function spyFunction(context: SpecContext, komondor: SpecPluginUtil, subject) {

  return function (...args) {
    context.add({
      type: 'fn/invoke',
      payload: args
    })
    const spiedArgs = args.map((arg, index) => {
      if (typeof arg === 'function') {
        return spyOnCallback(context, arg, undefined)
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            arg[key] = spyOnCallback(context, arg[key], [index, key])
          }
        })
      }
      return arg
    })
    let result
    try {
      result = subject.apply(this, spiedArgs)
    }
    catch (err) {
      context.add({
        type: 'fn/throw',
        payload: err
      })
      throw err
    }
    const returnSpy = komondor.getReturnSpy(context, result, 'fn')
    if (returnSpy) {
      return returnSpy
    }

    context.add({ type: 'fn/return', payload: result })
    return result
  }
}
