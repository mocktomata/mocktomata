// import { isPromise } from '../promise/isPromise';
import { ReferenceId, SpecPlugin } from '../spec';
import { getInheritedPropertyNames } from '../utils';
import { isClass } from './isClass';
import { isPromise } from '../promise/isPromise';

function classTracker<S>({ id, instantiate, getSpy }: SpecPlugin.CreateSpyContext, _subject: S) {
  let instanceRecorder: SpecPlugin.InstanceRecorder
  return {
    instantiate(args: any[]) {
      instanceRecorder = instantiate(id, args, {
        processArguments: (id, arg) => getSpy(id, arg)
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
      __komondor: { pending: boolean, instanceId: ReferenceId, publicMethods: string[] }
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondor = {
          pending: false,
          publicMethods: [],
          instanceId: tracker.getInstanceRecorder().setInstance(this)
        }
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

          const invocation = invoke(this.__komondor.instanceId, args, {
            processArguments: (id, arg) => getSpy(id, arg, { mode: 'autonomous' }),
            site: [p],
          })

          try {
            const result = method.apply(this, invocation.args)
            const spiedResult = invocation.returns(result, { processArgument: (id, result) => getSpy(id, result, { mode: 'passive' }) })
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
            const thrown = invocation.throws(err, { processArgument: (id, err) => getSpy(id, err, { mode: 'passive' }) })
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
  createStub({ instantiate, id, invoke, getSpy }, subject, _meta) {
    let instanceRecorder: SpecPlugin.InstanceRecorder
    const tracker = {
      instantiate(args: any[]) {
        instanceRecorder = instantiate(id, args, {
          processArguments: (id, arg) => getSpy(id, arg, { mode: 'autonomous' })
        })
        return instanceRecorder.args
      },
    }

    const StubClass = class extends subject {
      __komondor: { instanceId: ReferenceId }
      constructor(...args: any[]) {
        super(...tracker.instantiate(args))
        this.__komondor = { instanceId: instanceRecorder.setInstance(this) }
      }
    }
    getInheritedPropertyNames(StubClass).forEach(p => {
      StubClass.prototype[p] = function (this: InstanceType<typeof StubClass>, ...args: any[]) {
        const invocation = invoke(this.__komondor.instanceId, args, {
          processArguments: (id, arg) => getSpy(id, arg),
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
