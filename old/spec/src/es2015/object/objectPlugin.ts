import { KomondorPlugin } from '../../types';
import { KeyTypes } from 'type-plus';

export const objectPlugin: KomondorPlugin<Record<KeyTypes, any>> = {
  name: 'object',
  support(subject) {
    return subject !== null && typeof subject === 'object' && !Array.isArray(subject)
  },
  getSpy(context, subject) {
    const recorder = context.newRecorder()

    return new Proxy(subject, {
      get(target, prop) {
        const getter = recorder.get(prop)

        try {
          // https://github.com/Microsoft/TypeScript/issues/1863
          const result = target[prop as any]
          return getter.return(result)
        }
        catch (e) {
          throw getter.throw(e)
        }
      },
      set(target, prop, value) {
        const setter = recorder.set(prop, value)

        try {
          target[prop as any] = value
          setter.return(value)
          return true
        }
        catch (e) {
          setter.throw(e)
          return false
        }
      }
    })
  },
  getStub(context, subject) {
    return subject
  }
}
