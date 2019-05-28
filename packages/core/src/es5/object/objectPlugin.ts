import { KeyTypes } from 'type-plus';
import { KomondorPlugin } from '../../plugin';
import { getPropertyNames } from '../util';

export const objectPlugin: KomondorPlugin<Record<KeyTypes, any>> = {
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
            return getRecorder.return(result)
          }
          catch (e) {
            getRecorder.throw(e)
            throw e
          }
        },
        set(value: any) {
          const setRecorder = recorder.set(name, value)
          try {
            const result = subject[name] = value
            setRecorder.return(result)
          }
          catch (e) {
            setRecorder.throw(e)
            throw e
          }
        }
      }
      return p
    }, {} as any))
    const recorder = context.newSpyRecorder(spy, { props: propertyNames, accessed: [] as string[] })
    return spy
  },
  createStub: (context, subject) => {
    const propertyNames = getPropertyNames(subject)
    const stub: any = {}
    const describeProps = propertyNames.reduce((p, name) => {
      p[name] = {
        get() {
          const getter = recorder.get(name)
          // TODO: handle throw
          const result = subject[name]
          return getter.return(result)
        },
        set(value: any) {
          const setter = recorder.set(name, value)
          // TODO: handle throw
          const result = subject[name] = value
          return setter.return(result)
        }
      }
      return p
    }, {} as any)
    Object.defineProperties(stub, describeProps)
    const recorder = context.newStubRecorder(stub)
    return stub
  },
  createReplayer(context, value) {
    const stub: any = {}
    // const replayer = context.newReplayer(stub)

    return stub
  },
  get: (spy, prop) => {
    return spy[prop as any]
  }
}
