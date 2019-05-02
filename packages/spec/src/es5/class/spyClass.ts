
import { SpyContext, SpyInstance } from '../../types';
import { isPromise } from '../promise/isPromise';
import { getPropertyNames } from './getPropertyNames';

export function spyClass2(context: any, subject: any) {
  const recorder = context.newRecorder()
  const spiedClass = class extends subject {
    constructor(...args: any[]) {
      super(...args)
      context.construct(args)
    }
  }
  return spiedClass
}

export function spyClass(context: SpyContext, subject: any) {
  const spiedClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondor: any = {}

    constructor(...args: any[]) {
      // @ts-ignore
      super(...args)
      this.__komondor.instance = context.newInstance(args, { className: subject.name })
    }
  }
  const propertyNames = getPropertyNames(spiedClass)
  propertyNames.forEach(p => {
    const method = spiedClass.prototype[p]
    spiedClass.prototype[p] = function (...args: any[]) {
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

        // TODO: rethink SpyCall implmentation to avoid mixing promise and class logic together
        // This is not ideal as it mixes concerns.
        if (isPromise(returnValue)) {
          returnValue.then(() => this.__komondor.invoking = false)
        }
        else
          this.__komondor.invoking = false
        return returnValue
      }
      else {
        return method.apply(this, args)
      }
    }
  })
  return spiedClass
}
