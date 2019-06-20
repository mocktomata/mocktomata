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
  createStub: ({ player }, subject) => {
    const propertyNames = getPropertyNames(subject)
    const stub: any = {}
    const describeProps = propertyNames.reduce((p, name) => {
      p[name] = {
        get() {
          const getter = recorder.get(name)
          const result = getter.getResult()
          if (result.type === 'return') {
            return result.payload
          }
          else {
            throw result.payload
          }
        },
        set(value: any) {
          const setter = recorder.set(name, value)
          const result = setter.getResult()
          if (result.type === 'return') {
            return result.payload
          }
          else {
            throw result.payload
          }
        }
      }
      return p
    }, {} as any)
    Object.defineProperties(stub, describeProps)
    const recorder = player.declare(stub)
    return stub
  }
}
