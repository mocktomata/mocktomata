import { isPromise } from '../promise/isPromise';
import { getPropertyNames } from '../util';
import { isClass } from './isClass';
import { SpecPlugin } from '../spec';

export const classPlugin: SpecPlugin = {
  name: 'class',
  support: isClass,
  createSpy({ recorder }, subject) {
    const SpiedClass = class extends subject {
      __komondor: any = {}

      constructor(...args: any[]) {
        super(...args)
        this.__komondor.instance = spyRecorder.instantiate(args)
      }
    }
    const propertyNames = getPropertyNames(SpiedClass)
    propertyNames.forEach(p => {
      const method = SpiedClass.prototype[p]
      SpiedClass.prototype[p] = function (...args: any[]) {
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
    const spyRecorder = recorder.declare(SpiedClass)
    return SpiedClass
  },
  createStub({ recorder: player }, subject) {
    const StubClass = class extends subject {
      __komondorStub: any = {}
      constructor(...args: any[]) {
        super(...args)
        this.__komondorStub.instance = stubPlayer.instantiate(args)
      }
    }
    getPropertyNames(StubClass).forEach(p => {
      StubClass.prototype[p] = function (...args: any[]) {
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
    const stubPlayer = player.declare().setTarget(StubClass)
    return StubClass
  },
}
