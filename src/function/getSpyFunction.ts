import { SpyContext } from 'komondor-plugin'

export function spyFunction(context: SpyContext, subject) {
  const instance = context.newInstance()
  instance.construct(undefined, subject.name ? { functionName: subject.name } : undefined)
  return function (...args) {
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
  }
}
