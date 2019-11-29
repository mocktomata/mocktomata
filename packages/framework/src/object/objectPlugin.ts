import { SpecPlugin } from '../spec';
import { hasProperty, hasPropertyInPrototype } from '../utils';
// import { getPropertyNames } from '../utils';

export const objectPlugin: SpecPlugin<Record<string | number, any>, Record<string | number, any>> = {
  name: 'object',
  support: subject => {
    if (typeof subject === 'object' && subject !== null) return true

    if (typeof subject !== 'function') return false

    if (hasPropertyInPrototype(subject)) return false

    return true
  },
  createSpy: ({ getProperty, setMeta }, subject) => {
    const meta = setMeta({ callable: typeof subject === 'function' })

    return new Proxy(meta.callable ? function () { } : {}, {
      get(_, property: string) {
        if (!hasProperty(subject, property)) return undefined
        return getProperty([property], () => subject[property])
      },
      set(_, property: string, value: any) {
        return subject[property] = value
      }
    })
  },
  createStub: ({ getProperty }, _, meta) => {
    return new Proxy(meta.callable ? function () { } : {}, {
      get(_, property: string) {
        return getProperty([property])
      }
    })
  }
}
