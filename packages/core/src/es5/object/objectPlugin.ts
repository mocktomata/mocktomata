import { KeyTypes } from 'type-plus';
import { KomondorPlugin } from '../../plugin';
import { getPropertyNames } from '../util';

export const objectPlugin: KomondorPlugin<Record<KeyTypes, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  getSpy: (context, subject) => {
    const propertyNames = getPropertyNames(subject)
    const spy: any = {}
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
    Object.defineProperties(spy, describeProps)
    const recorder = context.newSpyRecorder(spy)
    return spy
  },
  getStub: (context, subject) => {
    return subject
  },
  get: (spy, prop) => {
    return spy[prop as any]
  }
}
