import { StubContext } from 'komondor-plugin'

export function stubFunction(context: StubContext, subject) {
  // TODO: checking subject for not undefined for the time being.
  // in new version it should be able to get the right subject.
  const instance = context.newInstance(undefined, subject && subject.name ? { functionName: subject.name } : undefined)
  return function (...args) {
    const call = instance.newCall()
    call.invoked(args)
    call.blockUntilReturn()
    if (call.succeed())
      return call.result()
    else
      throw call.thrown()
  }
}
