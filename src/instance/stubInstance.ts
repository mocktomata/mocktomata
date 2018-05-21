import { StubContext, SpecAction } from 'komondor-plugin'
import { getPropertyNames } from './getPropertyNames'

export function stubInstance(context: StubContext, subject, action: SpecAction) {
  const className = subject && subject.constructor.name || action.meta!.className
  const instance = context.newInstance(undefined, { className })
  if (subject) {
    const propertyNames = getPropertyNames(subject)
    propertyNames.forEach(p => {
      const original = subject[p]
      if (typeof original === 'function') {
        subject[p] = function (...args) {
          const call = instance.newCall({ site: [p] })
          call.invoked(args)
          call.blockUntilReturn()
          if (call.succeed()) {
            return call.result()
          }

          throw call.thrown()
        }
      }
    })
  }
  return subject
}
