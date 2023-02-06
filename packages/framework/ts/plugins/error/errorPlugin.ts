import { SerializableConverter } from 'iso-error'
import type { SpecPlugin } from '../../spec-plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { hasProperty } from '../../utils-internal/index.js'

const converter = new SerializableConverter()

export const errorPlugin: SpecPlugin<
  Error & Record<any, any>,
  { err: string, functionCalls: string[] }
> = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: ({ getProperty, invoke, setProperty, setMeta }, subject) => {
    const meta = setMeta({
      err: metarize(converter.toSerializable(subject)),
      functionCalls: [],
    })
    setMeta(meta)
    const spy = new Proxy(subject, {
      get(target: any, key: string) {
        if (!hasProperty(subject, key)) return undefined
        const prop = subject[key]
        if (typeof prop === 'function') {
          return (...args: any[]) => {
            meta.functionCalls.push(key)
            return invoke({ site: key, thisArg: spy, args }, ({ args }) => prop.apply(target, args))
          }
        }
        else {
          return getProperty({ key }, () => prop)
        }
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value }, value => subject[key] = value)
      }
    })
    return spy
  },
  createStub: ({ getProperty, setProperty, invoke }, _subject, meta) => {
    const base: any = converter.fromSerializable(demetarize(meta.err))
    const stub = new Proxy(base, {
      get(_: any, key: string) {
        if (meta.functionCalls.length > 0 && meta.functionCalls[0] === key) {
          return (...args: any[]) => {
            meta.functionCalls.shift()
            return invoke({ site: key, thisArg: stub, args })
          }
        }
        return getProperty({ key: key })
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value })
      }
    })
    return stub
  }
}
