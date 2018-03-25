import { SpyContext } from 'komondor-plugin'

function spyOnCallback(context: SpyContext, fn, meta) {
  return (...args) => {
    context.add('function/callback', args, meta)
    fn(...args)
  }
}


export function spyFunction(context: SpyContext, subject) {
  return function (...args) {
    const a = context.add('function/invoke', args)
    const spiedArgs = args.map((arg, index) => {
      if (typeof arg === 'function') {
        return spyOnCallback(context, arg, a.meta)
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            arg[key] = spyOnCallback(context, arg[key], {
              id: a.meta.id,
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
      context.add('function/throw', err)
      throw err
    }
    return context.addReturnAction('function/return', result)
    // const returnAction = context.add('function/return', result)
    // return context.getSpy(context, result, returnAction) || result
  }
}
