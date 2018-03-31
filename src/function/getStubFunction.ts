import { StubContext } from 'komondor-plugin'

export function stubFunction(context: StubContext) {
  return function (...args) {
    const call = context.newCall()
    call.invoked(args)
    if (call.succeed())
      return call.result()
    else
      throw call.thrown()
  }
}
