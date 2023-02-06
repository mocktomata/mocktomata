import type { SpecPlugin } from '../../spec-plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { hasProperty } from '../../utils-internal/index.js'

export const objectPlugin: SpecPlugin<Record<string | number, any>, string> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getProperty, setProperty, setMeta }, subject) => {
    setMeta(metarize(subject))
    return new Proxy(subject, {
      get(_: any, key: string) {
        if (!hasProperty(subject, key)) return undefined
        return getProperty({ key }, () => subject[key])
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value }, value => subject[key] = value)
      }
    })
  },
  createStub: ({ getProperty, setProperty }, _, meta) => {
    return new Proxy(demetarize(meta), {
      get(_: any, key: string) {
        return getProperty({ key })
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value })
      }
    })
  }
}
