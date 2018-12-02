import { SpyContext } from 'komondor-plugin'
import { getPartialProperties, assignPropertiesIfNeeded } from './composeWithSubject'

export function spyFunction(context: SpyContext, subject) {
  const meta: any = {}
  if (subject.name) {
    meta.functionName = subject.name
  }
  const properties = getPartialProperties(subject)
  if (properties) {
    meta.properties = properties
  }
  const instance = context.newInstance(undefined, Object.keys(meta).length > 0 ? meta : undefined)

  return assignPropertiesIfNeeded(function (...args) {
    const call = instance.newCall()
    const spiedArgs = call.invoke(args)

    let result
    try {
      result = subject.apply(this, spiedArgs)
    }
    catch (err) {
      throw call.throw(err)
    }
    return call.return(result)
  }, properties)
}
