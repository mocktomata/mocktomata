import { SpyContext } from 'komondor-plugin'

export function spyFunction(context: SpyContext, subject) {
  return function (...args) {
    const call = context.newCall()
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
