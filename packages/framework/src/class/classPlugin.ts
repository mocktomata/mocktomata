// import { isPromise } from '../promise/isPromise';
import { isPromise } from '../promise/isPromise';
import { SpecPlugin } from '../spec';
import { getInheritedPropertyNames } from '../utils';
import { isClass } from './isClass';

function classTracker<S>({ instantiate, getSpy }: SpecPlugin.SpyContext, _subject: S) {
  let instanceRecorder: SpecPlugin.InstantiationRecorder
  return {
    instantiate(args: any[]) {
      instanceRecorder = instantiate(args, {
        processArguments: (id, arg) => getSpy(arg)
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
    const { getSpy } = context
    const SpiedClass = class extends subject {
      __komondor: { pending: boolean, instanceRecorder: SpecPlugin.InstantiationRecorder, publicMethods: string[] }
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        const instanceRecorder = tracker.getInstanceRecorder()
        this.__komondor = {
          pending: false,
          publicMethods: [],
          instanceRecorder
        }
        instanceRecorder.setInstance(this)
      }
    }
    getInheritedPropertyNames(SpiedClass).forEach(p => {
      const method = SpiedClass.prototype[p]
      SpiedClass.prototype[p] = function (this: InstanceType<typeof SpiedClass>, ...args: any[]) {
        if (!this.__komondor.pending || this.__komondor.publicMethods.indexOf(p) >= 0) {
          this.__komondor.pending = true
          if (this.__komondor.publicMethods.indexOf(p) === -1) {
            this.__komondor.publicMethods.push(p)
          }

          const invocation = this.__komondor.instanceRecorder.invoke(args, {
            processArguments: arg => getSpy(arg, { mode: 'autonomous' }),
            site: [p],
          })

          try {
            const result = method.apply(this, invocation.args)
            const spiedResult = invocation.returns(result, { processArgument: result => getSpy(result, { mode: 'passive' }) })
            if (isPromise(spiedResult)) {
              spiedResult.then(
                () => this.__komondor.pending = false,
                () => this.__komondor.pending = false
              )
              return spiedResult
            }
            else {
              this.__komondor.pending = false
              return spiedResult
            }
          }
          catch (err) {
            const thrown = invocation.throws(err, { processArgument: err => getSpy(err, { mode: 'passive' }) })
            this.__komondor.pending = false
            throw thrown
          }
        }
        else {
          return method.apply(this, args)
        }
      }
    })

    return SpiedClass
  },
  createStub({ instantiate, getSpy }, subject, _meta) {
    let instanceResponder: SpecPlugin.InstantiationResponder
    const tracker = {
      instantiate(args: any[]) {
        instanceResponder = instantiate(args, {
          processArguments: (id, arg) => getSpy(arg, { mode: 'autonomous' })
        })
        return instanceResponder.args
      },
    }

    const StubClass = class extends subject {
      __komondor: { instanceResponder: SpecPlugin.InstantiationResponder }
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondor = { instanceResponder }
        instanceResponder.setInstance(this)
      }
    }
    getInheritedPropertyNames(StubClass).forEach(p => {
      StubClass.prototype[p] = function (this: InstanceType<typeof StubClass>, ...args: any[]) {
        const invocation = this.__komondor.instanceResponder.invoke(args, {
          processArguments: getSpy,
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
}
