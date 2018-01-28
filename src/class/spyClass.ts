import { SpecContext, SpecPluginUtil } from '../index';

export function spyClass(context: SpecContext, util: SpecPluginUtil, subject) {
  const spiedClass = class extends subject {
    // @ts-ignore
    // tslint:disable-next-line
    __komondorSpy = { methods: {} }

    constructor(...args) {
      // @ts-ignore
      super(...args)

      context.add({
        type: 'class/constructor',
        payload: args
      })
    }
  }

  let invoking = false
  for (let p in spiedClass.prototype) {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args) {
      if (!this.__komondorSpy.methods[p])
        this.__komondorSpy.methods[p] = { counter: 0 }
      else
        this.__komondorSpy.methods[p].counter++
      const methodId = this.__komondorSpy.methods[p].counter
      if (!invoking) {
        invoking = true
        context.add({
          type: 'class/invoke',
          payload: args,
          meta: {
            methodId,
            name: p
          }
        })
        const spiedArgs = args.map((arg, i) => {
          if (typeof arg === 'function') {
            return function (...cbArgs) {
              context.add({
                type: 'class/callback',
                payload: cbArgs,
                meta: {
                  name: p,
                  methodId,
                  callSite: i
                }
              })
              return arg.apply(this, cbArgs)
            }
          }
          return arg
        })
        const result = method.apply(this, spiedArgs)

        const returnAction = {
          type: 'class/return',
          payload: result,
          meta: { methodId }
        }
        context.add(returnAction)
        const resultSpy = util.getReturnSpy(context, result, returnAction)
        invoking = false
        return resultSpy || result
      }
      else {
        return method.apply(this, args)
      }
    }
  }
  return spiedClass
}
