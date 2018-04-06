import { SpyContext, SpyCall, SpyInstance } from 'komondor-plugin'

export function spyClass(context: SpyContext, subject) {
  const spiedClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondor: {
      instance: SpyInstance,
      call: SpyCall
    } = {} as any

    constructor(...args) {
      // @ts-ignore
      super(...args)
      const instance = this.__komondor.instance = context.newInstance()
      instance.construct(args, { className: subject.name })
    }
  }

  for (let p in spiedClass.prototype) {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args) {
      const invoking = this.__komondor.invoking
      const instance = this.__komondor.instance
      if (!invoking) {
        this.__komondor.invoking = true
        const call = instance.newCall()
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
    }
  }
  return spiedClass
}
