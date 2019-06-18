import { KomondorPlugin } from '../plugin';
import { hasPropertyInPrototype } from '../util';

export const functionPlugin: KomondorPlugin<Function> = {
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
    const stub = function (this: any, ...args: any[]) {
      const invocation = stubPlayer.invoke(args)
      if (invocation.succeed()) {
        return invocation.returns()
      }
      else {
        throw invocation.throws()
      }
    }
    const stubPlayer = player.declare(stub)
    return stub
  }
}
