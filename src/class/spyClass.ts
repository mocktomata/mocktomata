import { SpyContext, SpyInstance } from 'komondor-plugin'

export function spyClass(context: SpyContext, subject) {
  const SpiedSubject = new Proxy(subject, {
    construct(target, args) {
      const obj = Object.create(subject.prototype)
      this.apply(target, obj, args)
      const spyInstanceRecorder = context.newInstance(args, { className: subject.name })
      return spyInstance(spyInstanceRecorder, obj)
    },
    get(target, key) {
      // todo create invoke spy for static methods
      return target[key]
    },
    set(target, key, value) {
      // todo create property set action for static method
      return target[key] = value
    },
    apply(target, that, args) {
      target.apply(that, args)
    }
  })

  return SpiedSubject
}

function spyInstance(recorder: SpyInstance, obj) {
  const spyMethods = {}
  const proxy = new Proxy(obj, {
    get(target, key) {
      if (!spyMethods[key]) {
        spyMethods[key] = function (...args) {
          const call = recorder.newCall({ methodName: key })
          const spiedArgs = call.invoke(args)
          let result
          try {
            result = target[key](...spiedArgs)
          }
          catch (err) {
            const thrown = call.throw(err)
            throw thrown
          }

          return call.return(result)
        }.bind(target)
      }

      return spyMethods[key]
    },
    set(target, key, value) {
      // todo create property set action for method
      return target[key] = value
    }
  })
  return proxy
}

// import { isPromise } from '../promise/isPromise'
// import { getPropertyNames } from './getPropertyNames'

// export function spyClass(context: SpyContext, subject) {
//   const spiedClass = class extends subject {
//     // tslint:disable-next-line:variable-name
//     __komondor: any = {}

//     constructor(...args) {
//       // @ts-ignore
//       super(...args)
//       this.__komondor.instance = context.newInstance(args, { className: subject.name })
//     }
//   }
//   const propertyNames = getPropertyNames(spiedClass)
//   propertyNames.forEach(p => {
//     const method = spiedClass.prototype[p]
//     spiedClass.prototype[p] = function (...args) {
//       const invoking = this.__komondor.invoking
//       const instance: SpyInstance = this.__komondor.instance
//       if (!invoking) {
//         this.__komondor.invoking = true
//         const call = instance.newCall({ methodName: p })
//         const spiedArgs = call.invoke(args)
//         let result
//         try {
//           result = method.apply(this, spiedArgs)
//         }
//         catch (err) {
//           const thrown = call.throw(err)
//           this.__komondor.invoking = false
//           throw thrown
//         }
//         const returnValue = call.return(result)

//         if (isPromise(returnValue)) {
//           return returnValue.then(result => {
//             this.__komondor.invoking = false
//             return result
//           })
//         }
//         else
//           this.__komondor.invoking = false
//         return returnValue
//       }
//       else {
//         console.log('invoking')
//         return method.apply(this, args)
//       }
//     }
//   })
//   return spiedClass
// }
