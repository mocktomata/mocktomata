import { PluginUtil, SpecContext } from 'komondor-plugin'

function spyOnCallback(context: SpecContext, fn, meta) {
  return (...args) => {
    context.add({
      type: 'fn/callback',
      payload: args,
      meta
    })
    fn(...args)
  }
}

let counter = 0

export function spyFunction(context: SpecContext, komondor: PluginUtil, subject, action?) {
  const functionId = ++counter
  if (action) {
    action.meta.functionId = functionId
    action.meta.returnType = 'function'
  }
  return function (...args) {
    context.add({
      type: 'fn/invoke',
      payload: args,
      meta: {
        functionId
      }
    })
    const spiedArgs = args.map((arg, index) => {
      if (typeof arg === 'function') {
        return spyOnCallback(context, arg, { functionId })
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            arg[key] = spyOnCallback(context, arg[key], {
              functionId,
              callbackPath: [index, key]
            })
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
        payload: err,
        meta: { functionId }
      })
      throw err
    }
    const returnAction = { type: 'fn/return', payload: result, meta: { functionId } }
    context.add(returnAction)

    const out = komondor.getReturnSpy(context, result, returnAction) || result
    return out
  }
}
