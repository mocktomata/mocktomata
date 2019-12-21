import { SpecPlugin } from '../spec';
import { hasProperty } from '../utils';

export const objectPlugin: SpecPlugin<Record<string | number, any>, Record<string | number, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getProperty, setProperty, invoke }, subject) => {
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
  createStub: ({ getProperty, setProperty, invoke }) => {
    return new Proxy({}, {
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
