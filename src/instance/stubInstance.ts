import { StubContext, SpecAction } from 'komondor-plugin'
import { getPropertyNames, getProperties } from './getPropertyNames'

export function stubInstance(context: StubContext, subject, action: SpecAction) {
  if (subject) {
    const properties = getProperties(subject)
    const className = subject.constructor.name
    const instance = context.newInstance(undefined, { className, properties })
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
    return subject
  }
  else {
    const properties = action.meta!.properties
    // TODO: expand proxy support
    const proxy = new Proxy({}, {
      getPrototypeOf() {
        // tslint:disable-next-line
        return eval(`${action.meta!.className}.prototype`)
      },
      get(_, key) {
        const prop = properties[key]
        return prop && prop.descriptor && prop.descriptor.value
      }
    })
    return proxy
  }
}
