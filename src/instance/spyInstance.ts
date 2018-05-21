import { SpyContext } from 'komondor-plugin'

import { isPromise } from '../promise/isPromise'
import { getPropertyNames } from './getPropertyNames'

export function spyInstance(context: SpyContext, subject) {
  const instance = context.newInstance(undefined, { className: subject.constructor.name })
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
