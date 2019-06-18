import { KomondorPlugin } from '../plugin';
import { isPromise } from '../promise/isPromise';
import { getPropertyNames } from '../util';
import { isClass } from './isClass';

export const classPlugin: KomondorPlugin = {
  name: 'class',
  support: isClass,
  createSpy({ recorder }, subject) {
    const spiedClass = class extends subject {
      // tslint:disable-next-line:variable-name
      __komondor: any = {}

      constructor(...args: any[]) {
        // @ts-ignore
        super(...args)
        this.__komondor.instance = spyRecorder.construct(args)
      }
    }
    const propertyNames = getPropertyNames(spiedClass)
    propertyNames.forEach(p => {
      const method = spiedClass.prototype[p]
      spiedClass.prototype[p] = function (...args: any[]) {
        const invoking = this.__komondor.invoking
        const instance: any = this.__komondor.instance
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
    const spyRecorder = recorder.declare(spiedClass)
    return spiedClass
  },
  createStub({player}, subject) {
    const stubClass = class extends subject {
      // tslint:disable-next-line:variable-name
      __komondorStub: any = {}
      constructor(...args: any[]) {
        // @ts-ignore
        super(...args)
        this.__komondorStub.instance = stubPlayer.construct(args)
      }
    }
    getPropertyNames(stubClass).forEach(p => {
      stubClass.prototype[p] = function (...args: any[]) {
        const instance = this.__komondorStub.instance
        const call = instance.newCall({ methodName: p })
        call.invoked(args)
        call.blockUntilReturn()
        if (call.succeed()) {
          return call.result()
        }

        throw call.thrown()
      }
    })
    const stubPlayer = player.declare(stubClass)
    return stubClass
  },
}
