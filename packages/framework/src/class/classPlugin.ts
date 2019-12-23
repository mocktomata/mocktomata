import { SpecPlugin } from '../spec';
import { getInheritedPropertyNames } from '../utils';
import { isClass } from './isClass';
import { isPromise } from 'type-plus';

// spyHelper is used to get around class.constructor.super must be the first line in the constructor.
function spyHelper({ instantiate }: SpecPlugin.SpyContext) {
  let recorder: SpecPlugin.SpyContext.instantiate.Recorder
  return {
    instantiate(args: any[]) {
      let spiedArgs: any[]
      recorder = instantiate({ args }, ({ args }) => spiedArgs = args)
      // @ts-ignore
      return spiedArgs
    },
    getRecorder() {
      return recorder
    }
  }
}

function stubHelper({ instantiate }: SpecPlugin.StubContext) {
  let responder: SpecPlugin.StubContext.instantiate.Responder
  return {
    instantiate(args: any[]) {
      responder = instantiate({ args })
      return args
    },
    getResponder() {
      return responder
    }
  }
}

export const classPlugin: SpecPlugin = {
  name: 'class',
  support: isClass,
  createSpy(context, subject) {
    const helper = spyHelper(context)
    const SpiedClass = class extends subject {
      __komondor: { pending: boolean, publicMethods: string[], instanceRecorder: SpecPlugin.SpyContext.instantiate.Recorder }
      constructor(...args: any[]) {
        super(...helper.instantiate(args))
        const instanceRecorder = helper.getRecorder()
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
          try {
            let result = this.__komondor.instanceRecorder.invoke({ site: p, thisArg: this, args }, ({ args }) => method.apply(this, args))
            if (isPromise(result)) {
              result = result.then(v => {
                this.__komondor.pending = false
                return v
              })
            }
            else {
              this.__komondor.pending = false
            }
            return result
          }
          catch (e) {
            this.__komondor.pending = false
            throw e
          }
        }
        else {
          return method.apply(this, args)
        }
      }
    })

    return SpiedClass
  },
  createStub(context, subject, _meta) {
    const helper = stubHelper(context)

    const StubClass = class extends subject {
      __komondor: { pending: boolean, publicMethods: string[], instanceResponder: SpecPlugin.StubContext.instantiate.Responder }
      constructor(...args: any[]) {
        super(...helper.instantiate(args))
        const instanceResponder = helper.getResponder()
        this.__komondor = {
          pending: false,
          publicMethods: [],
          instanceResponder
        }
        instanceResponder.setInstance(this)
      }
    }
    getInheritedPropertyNames(StubClass).forEach(p => {
      StubClass.prototype[p] = function (this: InstanceType<typeof StubClass>, ...args: any[]) {
        return this.__komondor.instanceResponder.invoke({ site: p, thisArg: this, args })
      }
    })
    return StubClass
  },
}
