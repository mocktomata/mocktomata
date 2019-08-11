import { KeyTypes } from 'type-plus';
import { SpecPlugin } from '../spec';
import { getPropertyNames } from '../util';

export const objectPlugin: SpecPlugin<Record<KeyTypes, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: (context, subject) => {
    const propertyNames = getPropertyNames(subject)
    const spy = Object.defineProperties({}, propertyNames.reduce((p, name) => {
      p[name] = {
        get() {
          const getRecorder = recorder.get(name)
          try {
            const result = subject[name]
            return getRecorder.returns(result)
          }
          catch (e) {
            getRecorder.throws(e)
            throw e
          }
        },
        set(value: any) {
          const setRecorder = recorder.set(name, value)
          try {
            const result = subject[name] = value
            setRecorder.returns(result)
          }
          catch (e) {
            setRecorder.throws(e)
            throw e
          }
        }
      }
      return p
    }, {} as any))
    const recorder = context.recorder.declare(spy)
    return spy
  },
  createStub: ({ recorder: player }, subject) => {
    const recorder = player.declare()
    const propertyNames = getPropertyNames(subject)
    const stub: any = {}
    recorder.setTarget(stub)
    const describeProps = propertyNames.reduce((p, name) => {
      p[name] = {
        get() {
          const getter = recorder.get(name)
          try {
            const result = subject[name]
            return getter.returns(result)
          }
          catch (e) {
            getter.throws(e)
            throw e
          }
          // const result = getter.getResult()
          // if (result.type === 'return') {
          //   return getter.returns(result.payload)
          // }
          // else {
          //   throw getter.throws(result.payload)
          // }
        },
        set(value: any) {
          const setter = recorder.set(name, value)
          const result = setter.getResult()
          if (result.type === 'return') {
            return setter.returns(result.payload)
          }
          else {
            throw setter.throws(result.payload)
          }
        }
      }
      return p
    }, {} as any)
    Object.defineProperties(stub, describeProps)
    return stub
  },
  createRepresentation: ({ process }, subject) => Object.keys(subject).reduce((p, k) => {
    p[k] = process(subject[k])
    return p
  }, {} as any),
  recreateSubject: ({ process }, input) => Object.keys(input).reduce((p, k) => {
    p[k] = process(input[k])
    return p
  }, {} as any),
}
