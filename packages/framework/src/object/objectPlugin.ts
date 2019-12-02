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
        return invoke(undefined, ({ withThisArg, withArgs }) => subject.apply(withThisArg(thisArg), withArgs(args)))
      },
      get(_, property: string) {
        if (!hasProperty(subject, property)) return undefined
        return getProperty({ site: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        return subject[property] = value
      }
    })
  },
  createStub: ({ getProperty, invoke }, _, meta) => {
    return new Proxy(meta.callable ? function () { } : {}, {
      apply: function (_target, thisArg, args: any[] = []) {
        return invoke(undefined, ({ withArgs, withThisArg, getResult }) => {
          const spiedArgs = args ? args.map(arg => getSpy(arg, { mode: 'autonomous' })) : []
          withArgs(spiedArgs)
          withThisArg(thisArg)
          try {
            return getSpy(getResult(), { mode: 'passive' })
          }
          catch (err) {
            throw getSpy(err, { mode: 'passive' })
          }
        })
      },
      get(_, property: string) {
        return getProperty({ site: property })
      }
    })
  }
}
