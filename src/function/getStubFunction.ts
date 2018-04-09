import { StubContext } from 'komondor-plugin'

export function stubFunction(context: StubContext) {
  const instance = context.newInstance()
  return function (...args) {
    const call = instance.newCall()
    call.invoked(args)
    call.waitSync()
    if (call.succeed())
      return call.result()
    else
      throw call.thrown()
  }
}
