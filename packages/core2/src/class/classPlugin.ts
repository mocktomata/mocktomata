// import { isPromise } from '../promise/isPromise';
import { SpecPlugin, SpyContext, InstanceRecorder, ReferenceId } from '../spec';
import { getInheritedPropertyNames } from '../utils';
import { isClass } from './isClass';
import { createConsoleLogReporter } from 'standard-log';

function classTracker<S>({ id, instantiate, getSpy }: SpyContext, _subject: S) {
  let instanceRecorder: InstanceRecorder
  return {
    instantiate(args: any[]) {
      instanceRecorder = instantiate(id, args, {
        transform: (id, arg) => getSpy(id, arg, { mode: 'autonomous' })
      })
      return instanceRecorder.args
    },
    getInstanceRecorder() {
      return instanceRecorder!
    }
  }
}

export const classPlugin: SpecPlugin = {
  name: 'class',
  support: isClass,
  createSpy(context, subject) {
    const tracker = classTracker(context, subject)
    const { invoke, getSpy } = context
    const SpiedClass = class extends subject {
      __komondorInstanceRecorder: InstanceRecorder
      __komondorInstanceId: ReferenceId
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondorInstanceRecorder = tracker.getInstanceRecorder()
        this.__komondorInstanceId = this.__komondorInstanceRecorder.setInstance(this)
      }
    }
    getInheritedPropertyNames(SpiedClass).forEach(p => {
      const method = SpiedClass.prototype[p]
      SpiedClass.prototype[p] = function (this: InstanceType<typeof SpiedClass>, ...args: any[]) {
        // console.log(`invoke`, args)
        const invocation = invoke(this.__komondorInstanceId, args, {
          transform: (id, arg) => getSpy(id, arg, { mode: 'autonomous' }),
          site: [p],
        })
        try {
          const result = method.apply(this, invocation.args)
          return invocation.returns(result, { transform: (id, result) => getSpy(id, result, { mode: 'passive' }) })
        }
        catch (err) {
          throw invocation.throws(err, { transform: (id, err) => getSpy(id, err, { mode: 'passive' }) })
        }
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
  createStub({ instantiate, id, invoke, getSpy }, subject, _meta) {
    let instanceRecorder: InstanceRecorder
    const tracker = {
      instantiate(args: any[]) {
        instanceRecorder = instantiate(id, args, {
          transform: (id, arg) => getSpy(id, arg, { mode: 'autonomous' })
        })
        return instanceRecorder.args
      },
    }

    const StubClass = class extends subject {
      __komondorInstanceRecorder: InstanceRecorder
      __komondorInstanceId: ReferenceId
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondorInstanceRecorder = instanceRecorder
        this.__komondorInstanceId = instanceRecorder.setInstance(this)
      }
    }
    getInheritedPropertyNames(StubClass).forEach(p => {
      StubClass.prototype[p] = function (this: InstanceType<typeof StubClass>, ...args: any[]) {
        const invocation = invoke(this.__komondorInstanceId, args, {
          transform: (id, arg) => getSpy(id, arg),
          site: [p]
        })
        const result = invocation.getResult()
        if (result.type === 'return') {
          return invocation.returns(result.value)
        }
        else {
          throw invocation.throws(result.value)
        }
      }
    })
    return StubClass
  },
  // createStub: (_, meta) => {
  //   return meta
  // },
}
