import { isPromise } from 'type-plus';
import { SpecPlugin } from '../spec';
import { createMap, getInheritedPropertyNames, metarize, demetarize } from '../utils';
import { isClass } from './isClass';
import { ChildOfDummy } from '../test-artifacts';

type SpyTrackData = { pending: boolean, publicMethods: string[], instanceRecorder: SpecPlugin.SpyContext.instantiate.Recorder }
type StubTrackData = { instanceResponder: SpecPlugin.StubContext.instantiate.Responder }

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

const map = createMap()

export const classPlugin: SpecPlugin<new (...args: any[]) => void> = {
  name: 'class',
  support: isClass,
  createSpy(context, subject) {
    context.setMeta(metarize(subject))
    // console.log('createSpy', subject, subject.prototype, subject.prototype.constructor)
    const Spy: any = function (...args: any[]) {
      return context.instantiate2({ args }, ({ args }) => {
        const _this = new subject(...args)
        Object.setPrototypeOf(_this, new.target.prototype)
        return _this
      })
    }

    Object.setPrototypeOf(Spy.prototype, subject.prototype)
    Object.setPrototypeOf(Spy, subject)

    return Spy




    // const helper = spyHelper(context)
    // const SpiedClass = class extends subject {
    //   constructor(...args: any[]) {
    //     super(...helper.instantiate(args))
    //     const instanceRecorder = helper.getRecorder()
    //     map.set(this, {
    //       pending: false,
    //       publicMethods: [],
    //       instanceRecorder
    //     })
    //     instanceRecorder.setInstance(this)
    //   }
    // }
    // getInheritedPropertyNames(SpiedClass).forEach(p => {
    //   const method = SpiedClass.prototype[p]
    //   SpiedClass.prototype[p] = function (this: InstanceType<typeof SpiedClass>, ...args: any[]) {
    //     const tracker = map.get(this) as SpyTrackData
    //     if (!tracker.pending || tracker.publicMethods.indexOf(p) >= 0) {
    //       tracker.pending = true
    //       if (tracker.publicMethods.indexOf(p) === -1) {
    //         tracker.publicMethods.push(p)
    //       }
    //       try {
    //         let result = tracker.instanceRecorder.invoke({ site: p, thisArg: this, args }, ({ args }) => method.apply(this, args))
    //         if (isPromise(result)) {
    //           result = result.then(v => {
    //             tracker.pending = false
    //             return v
    //           })
    //         }
    //         else {
    //           tracker.pending = false
    //         }
    //         return result
    //       }
    //       catch (e) {
    //         tracker.pending = false
    //         throw e
    //       }
    //     }
    //     else {
    //       return method.apply(this, args)
    //     }
    //   }
    // })

    // return SpiedClass
  },
  createStub(context, subject, meta) {
    const base = subject || demetarize(meta)
    // console.log('yyy', base, ChildOfDummy)
    // console.log('yyy', base == ChildOfDummy)
    // console.log('yyy', base === ChildOfDummy)
    // console.log('createstub base', base, base.prototype, base.prototype.constructor)
    const Stub: any = function (...args: any[]) {
      return context.instantiate2({ args }, ({ args }) => {
        // console.log('create instance now')
        const _this = new base(...args)
        Object.setPrototypeOf(_this, new.target.prototype)
        return _this
      })
    }

    Object.setPrototypeOf(Stub.prototype, base.prototype)
    Object.setPrototypeOf(Stub, base)

    return Stub

    // const helper = stubHelper(context)

    // const StubClass = class extends subject {
    //   constructor(...args: any[]) {
    //     super(...helper.instantiate(args))
    //     const instanceResponder = helper.getResponder()
    //     map.set(this, { instanceResponder })
    //     instanceResponder.setInstance(this)
    //   }
    // }
    // getInheritedPropertyNames(StubClass).forEach(p => {
    //   StubClass.prototype[p] = function (this: InstanceType<typeof StubClass>, ...args: any[]) {
    //     const tracker = map.get(this) as StubTrackData
    //     return tracker.instanceResponder.invoke({ site: p, thisArg: this, args })
    //   }
    // })
    // return StubClass
  },
}
