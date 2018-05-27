import { SpyContext } from 'komondor-plugin'

// export function spyInstance(context: SpyContext, subject) {
//   const recorder = context.newInstance(undefined, { className: subject.constructor.name })
//   const spyMethods = {}
//   const proxy = new Proxy(subject, {
//     get(target, key) {
//       if (!spyMethods[key]) {
//         if (typeof target[key] === 'function')
//           spyMethods[key] = function (...args) {
//             const call = recorder.newCall({ methodName: key })
//             const spiedArgs = call.invoke(args)
//             let result
//             try {
//               result = target[key](...spiedArgs)
//             }
//             catch (err) {
//               const thrown = call.throw(err)
//               throw thrown
//             }

//             return call.return(result)
//           }.bind(target)
//       }

//       return spyMethods[key] || target[key]
//     },
//     set(target, key, value) {
//       // todo create property set action for method
//       return target[key] = value
//     }
//   })
//   return proxy
// }

import { isPromise } from '../promise/isPromise'
import { getPropertyNames, getProperties } from './getPropertyNames'

export function spyInstance(context: SpyContext, subject) {
  const properties = getProperties(subject)
  const instance = context.newInstance(undefined, { className: subject.constructor.name, properties })
  subject.__komondor = {}
  const propertyNames = getPropertyNames(subject)
  propertyNames.forEach(p => {
    const original = subject[p]
    if (typeof original === 'function') {
      subject[p] = function (...args) {
        const invoking = this.__komondor.invoking
        if (!invoking) {
          subject.__komondor.invoking = true
          const call = instance.newCall({ site: [p] })
          const spiedArgs = call.invoke(args)
          let result
          try {
            result = original.apply(this, spiedArgs)
          }
          catch (err) {
            const thrown = call.throw(err)
            this.__komondor.invoking = false
            throw thrown
          }
          const returnValue = call.return(result)
          if (isPromise(returnValue)) {
            return returnValue.then(result => {
              this.__komondor.invoking = false
              return result
            })
          }
          else
            this.__komondor.invoking = false
          return returnValue
        }
        else {
          return original.apply(this, args)
        }
      }
    }
  })
  return subject
}
