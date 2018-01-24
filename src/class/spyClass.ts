import { SpecContext, SpecPluginUtil } from '../index';

export function spyClass(context: SpecContext, _util: SpecPluginUtil, subject) {
  const spiedClass = class extends subject {
    constructor(...args) {
      context.add({
        type: 'class/constructor',
        payload: args
      })

      // @ts-ignore
      super(...args)
    }
  }

  let invoking = false
  for (let p in spiedClass.prototype) {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args) {
      if (!invoking) {
        invoking = true
        context.add({
          type: 'class/invoke',
          payload: args,
          meta: {
            name: p
          }
        })
        const result = method.apply(this, args)

        context.add({
          type: 'class/return',
          payload: result
        })
        invoking = false
        return result
      }
      else {
        return method.apply(this, args)
      }
    }
  }
  return spiedClass
}
