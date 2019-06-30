import { hasPropertyInPrototype } from '../util';
import { SpecPlugin } from '../spec';

export const functionPlugin: SpecPlugin<Function> = {
  name: 'function',
  support: subject => {
    if (typeof subject !== 'function') return false

    if (hasPropertyInPrototype(subject)) return false

    return true
  },
  createSpy: ({ recorder }, subject) => {
    const spy = function (this: any, ...args: any[]) {
      const invocation = spyRecorder.invoke(args)
      try {
        return invocation.returns(subject.apply(this, args))
      }
      catch (err) {
        throw invocation.throws(err)
      }
    }
    const spyRecorder = recorder.declare(spy)
    return spy
  },
  createStub: ({ player }, subject) => {
    const stubPlayer = player.declare()
    const stub = function (this: any, ...args: any[]) {
      const invocation = stubPlayer.invoke(args)
      const result = invocation.getResult()
      if (result.type === 'return') {
        return invocation.returns(result.payload)
      }
      else {
        throw invocation.throws(result.payload)
      }
    }
    stubPlayer.setTarget(stub)
    return stub
  }
}
