import { SpecPlugin } from '../spec-plugin'
import { demetarize, hasProperty, metarize } from '../utils-internal'

export const objectPlugin: SpecPlugin<Record<string | number, any>, string> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getProperty, setProperty, setMeta }, subject) => {
    setMeta(metarize(subject))
    return new Proxy(subject, {
      get(_: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        return getProperty({ key: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        setProperty({ key: property, value }, value => subject[property] = value)
        return true
      }
    })
  },
  createStub: ({ getProperty, setProperty }, _, meta) => {
    return new Proxy(demetarize(meta), {
      get(_: any, property: string) {
        return getProperty({ key: property })
      },
      set(_, key: string, value: any) {
        setProperty({ key, value })
        return true
      }
    })
  }
}
