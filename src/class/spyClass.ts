import { SpyContext } from 'komondor-plugin'

export function spyClass(context: SpyContext, subject) {
  const spiedClass = class extends subject {
    // @ts-ignore
    // tslint:disable-next-line
    __komondor = {}

    constructor(...args) {
      // @ts-ignore
      super(...args)

      context.add('class', 'constructor', args)
    }
  }

  // let invoking = false
  for (let p in spiedClass.prototype) {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args) {
      const invoking = this.__komondor.invoking
      if (!invoking) {
        this.__komondor.invoking = true
        const call = context.newCall()
        const spiedArgs = call.invoke(args, { methodName: p })
        let result
        try {
          result = method.apply(this, spiedArgs)
        }
        catch (err) {
          const thrown = call.throw(err, { methodName: p })
          this.__komondor.invoking = false
          throw thrown
        }
        const returnValue = call.return(result, { methodName: p })
        this.__komondor.invoking = false
        return returnValue
      }
      else {
        return method.apply(this, args)
      }
      // if (!this.__komondorSpy.methods[p])
      //   this.__komondorSpy.methods[p] = { counter: 0 }
      // else
      //   this.__komondorSpy.methods[p].counter++
      // const methodId = this.__komondorSpy.methods[p].counter
      // if (!invoking) {
      //   invoking = true
      //   context.add('class', 'invoke', args, { name: p, methodId })
      //   const spiedArgs = args.map((arg, i) => {
      //     if (typeof arg === 'function') {
      //       return function (...cbArgs) {
      //         context.add('class', 'callback', cbArgs, {
      //           name: p,
      //           methodId,
      //           callSite: i
      //         })
      //         return arg.apply(this, cbArgs)
      //       }
      //     }
      //     return arg
      //   })
      //   const result = method.apply(this, spiedArgs)

      //   const resultSpy = context.addReturnAction('class', 'return', result, { methodId })

      //   invoking = false
      //   return resultSpy || result
      // }
      // else {
      //   return method.apply(this, args)
      // }
    }
  }
  return spiedClass
}
