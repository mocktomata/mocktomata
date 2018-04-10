import { SpyContext, SpyInstance } from 'komondor-plugin'

export function spyClass(context: SpyContext, subject) {
  const spiedClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondor: any = {}

    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.__komondor.instance = context.newInstance(args, { className: subject.name })
    }
  }

  for (let p in spiedClass.prototype) {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args) {
      const invoking = this.__komondor.invoking
      const instance: SpyInstance = this.__komondor.instance
      if (!invoking) {
        this.__komondor.invoking = true
        const call = instance.newCall({ methodName: p })
        const spiedArgs = call.invoke(args)
        let result
        try {
          result = method.apply(this, spiedArgs)
        }
        catch (err) {
          const thrown = call.throw(err)
          this.__komondor.invoking = false
          throw thrown
        }
        const returnValue = call.return(result)
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
