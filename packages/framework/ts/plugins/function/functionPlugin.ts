import type { AnyFunction } from 'type-plus'
import type { SpecPlugin } from '../../spec-plugin/types.js'
import { demetarize, hasProperty, hasPropertyInPrototype, metarize } from '../../utils-internal/index.js'

export const functionPlugin: SpecPlugin<AnyFunction & Record<any, any>, string> = {
  name: 'function',
  support: subject => {
    if (typeof subject !== 'function') return false

    if (hasPropertyInPrototype(subject)) return false

    return true
  },
  /**
   * types of subjects:
   * * the actual spec subject
   * * a supplied function (from arg) that the subject should invoke
   * * a supplied function (from arg) that the caller should invoke
   * * a function created by the subject that is
   * *   returned or thrown, or
   * *   added to the argument (out param, modifying the input directly), and
   * *   the subject should invoke, or
   * *   the caller should invoke.
   * * for object/instance, the properties can be in or out location.
   * func foo({ cb }) {
   *   cb() // active call
   *   return { body }
   * }
   * const r = foo(...)
   * r.body() // passive call
   * func prom() {
   *   return Promise.resolve()
   * }
   * const p = prom()
   * p.then(() => { // active call
   *
   * })
   */
  createSpy: ({ getProperty, setProperty, invoke, setMeta }, subject) => {
    setMeta(metarize(subject))
    return new Proxy(subject, {
      apply(_, thisArg, args: any[]) {
        return invoke({ thisArg, args }, ({ thisArg, args }) => {
          return subject.apply(thisArg, args)
        })
      },
      get(target: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        if (property === 'call' || property === 'apply' || property === 'toString') return target[property]
        return getProperty({ key: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        return setProperty({ key: property, value }, (value) => subject[property] = value)
      }
    })
  },
  createStub: ({ getProperty, setProperty, invoke }, _, meta) => {
    const base = demetarize(meta);
    const stub = new Proxy(base, {
      apply: function (_, thisArg, args: any[]) {
        return invoke({ thisArg, args })
      },
      get(target: any, property: string) {
        if (property === 'call' || property === 'apply' || property === 'toString') return target[property]

        return getProperty({ key: property })
      },
      set(_, property: string, value: any) {
        return setProperty({ key: property, value })
      }
    })
    return stub
  }
}
