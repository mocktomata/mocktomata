import { SpecPlugin } from '../spec-plugin'
import { demetarize, hasProperty, metarize } from '../utils-internal';

export const objectPlugin: SpecPlugin<Record<string | number, any>, string> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getProperty, setProperty, invoke, setMeta }, subject) => {
    setMeta(metarize(subject))
    return new Proxy(subject, {
      apply(_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args }, ({ thisArg, args }) => subject.apply(thisArg, args))
      },
      get(_: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        return getProperty({ key: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        return setProperty({ key: property, value }, value => subject[property] = value)
      }
    })
  },
  createStub: ({ getProperty, setProperty, invoke }, _, meta) => {
    return new Proxy(demetarize(meta), {
      apply(_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args })
      },
      get(_: any, property: string) {
        return getProperty({ key: property })
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value })
      }
    })
  }
}
