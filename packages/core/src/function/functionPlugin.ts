import { reduceKey } from 'type-plus';
import { SpecPlugin } from '../spec';
import { hasPropertyInPrototype } from '../util';

export const functionPlugin: SpecPlugin<Function, Record<string, any>> = {
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
  createStub({ player }, subject, representation) {
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
    if (representation) {
      Object.assign(stub,
        reduceKey(representation, (p, k) => {
          // p[k] = player.resolve(representation[k])
          return p
        }, {} as Record<string, any>))
    }
    stubPlayer.setTarget(stub)
    if (!subject) {
      // player.on('invoke', args => {
      //   stub(...args)
      // })
    }
    return stub
  },
  recreateSubject() {
    return () => { }
  }
}
