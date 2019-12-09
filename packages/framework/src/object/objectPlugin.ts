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
  createSpy: ({ getProperty, setMeta, invoke }, subject) => {
    const meta = setMeta({ callable: typeof subject === 'function' })

    return new Proxy(meta.callable ? function () { } : {}, {
      apply(_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args }, ({ thisArg, args }) => subject.apply(thisArg, args))
      },
      get(target: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        if (meta.callable && property === 'apply') {
          return target[property]
        }
        return getProperty({ key: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        return subject[property] = value
      }
    })
  },
  createStub: ({ getProperty, invoke }, _, meta) => {
    return new Proxy(meta.callable ? function () { } : {}, {
      apply: function (_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args })
      },
      get(target: any, property: string) {
        if (meta.callable && property === 'apply') {
          return target[property]
        }
        return getProperty({ key: property })
      }
    })
  }
}
