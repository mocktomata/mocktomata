// import { isPromise } from '../promise/isPromise';
import { SpecPlugin, SpyContext, InstanceRecorder } from '../spec';
import { getInheritedPropertyNames } from '../utils';
import { isClass } from './isClass';

function classTracker<S>({ instantiate, getSpy }: SpyContext<S>, _subject: S) {
  let instanceRecorder: InstanceRecorder
  return {
    instantiate(args: any[]) {
      instanceRecorder = instantiate(args, { mode: 'passive', transform: (id, arg) => getSpy(id, arg, { mode: 'autonomous' }) })
      return instanceRecorder.args
    },
    getInstanceTracker() {
      return instanceRecorder!
    }
  }
}

export const classPlugin: SpecPlugin = {
  name: 'class',
  support: isClass,
  createSpy(context, subject) {
    const tracker = classTracker(context, subject)

    const SpiedClass = class extends subject {
      __komondorInstanceTracker: any
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondorInstanceTracker = tracker.getInstanceTracker()
      }
    }
    const propertyNames = getInheritedPropertyNames(SpiedClass)
    propertyNames.forEach(p => {
      const method = SpiedClass.prototype[p]
      SpiedClass.prototype[p] = function (this: InstanceType<typeof SpiedClass>, ...args: any[]) {
        // console.log(`invoke`, args)
        // this.__komondorInstanceTracker.invoke(args, { transform: arg => context.getSpy(arg) })
        return method.apply(this, args)
      }
    })

    return SpiedClass
    // const SpiedClass = class extends subject {
    //   __komondorInstanceTracker: any
    //   constructor(...args: any[]) {
    //     super(...tracker.instantiate(args))
    //     this.__komondorInstanceTracker = tracker.getInstanceTracker()
    //   }
    // }
    // const propertyNames = getPropertyNames(SpiedClass)
    // propertyNames.forEach(p => {
    //   const method = SpiedClass.prototype[p]
    //   SpiedClass.prototype[p] = function (this: InstanceType<typeof SpiedClass>, ...args: any[]) {
    //     const invoking = this.__komondor.invoking
    //     const instance: any = this.__komondor.instance
    //     if (!invoking) {
    //       this.__komondor.invoking = true
    //       const invocation = instance.invoke(args, {
    //         transform: arg => context.getSpy(arg, { mode: 'autonomous' }),
    //         site: [p]
    //       })
    //       let result
    //       try {
    //         result = method.apply(this, invocation.args)
    //       }
    //       catch (err) {
    //         const thrown = invocation.throw(err)
    //         this.__komondor.invoking = false
    //         throw thrown
    //       }
    //       const returnValue = invocation.return(result)

    //       // TODO: rethink SpyCall implmentation to avoid mixing promise and class logic together
    //       // This is not ideal as it mixes concerns.
    //       if (isPromise(returnValue)) {
    //         returnValue.then(() => this.__komondor.invoking = false)
    //       }
    //       else
    //         this.__komondor.invoking = false
    //       return returnValue
    //     }
    //     else {
    //       return method.apply(this, args)
    //     }
    //   }
    // })

    return SpiedClass
  },
  // createStub({ instantiate }, subject) {
  //   const StubClass = class extends subject {
  //     __komondorStub: any = {}
  //     constructor(...args: any[]) {
  //       super(...args)
  //       this.__komondorStub.instance = instantiate(args)
  //     }
  //   }
  //   getPropertyNames(StubClass).forEach(p => {
  //     StubClass.prototype[p] = function (...args: any[]) {
  //       const instance = this.__komondorStub.instance
  //       const call = instance.newCall({ methodName: p })
  //       call.invoked(args)
  //       call.blockUntilReturn()
  //       if (call.succeed()) {
  //         return call.result()
  //       }

  //       throw call.thrown()
  //     }
  //   })
  //   return StubClass
  // },
  createStub: (_, meta) => {
    return meta
  },
}
