import { IsoError } from 'iso-error'
import type { SpecPlugin } from '../../spec-plugin/types.js'
import { hasProperty } from '../../utils-internal/index.js'
import { demetarize, metarize } from '../../utils-internal/metarize.js'

export const errorPlugin: SpecPlugin<Error & Record<any, any>, string> = {
  name: 'error',
  support: subject => subject instanceof Error,
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
  createStub: ({ getProperty, setProperty }, _subject, meta) => {
    return new Proxy(IsoError.fromSerializable(demetarize(meta)), {
      get(_: any, key: string) {
        return getProperty({ key })
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value })
      }
    })
  }
}
