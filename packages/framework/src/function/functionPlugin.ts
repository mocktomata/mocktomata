import { SpecPlugin } from '../spec';
import { hasProperty, hasPropertyInPrototype } from '../utils';

export const functionPlugin: SpecPlugin<Function & Record<any, any>, Record<string, any>> = {
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
  createSpy: ({ getProperty, invoke }, subject) => {
    return new Proxy(subject, {
      apply(_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args }, ({ thisArg, args }) => subject.apply(thisArg, args))
      },
      get(target: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        if (property === 'apply') return target[property]
        return getProperty({ key: property }, () => subject[property])
      },
      set(_, property: string, value: any) {
        return subject[property] = value
      }
    })
  },
  createStub: ({ getProperty, invoke }) => {
    return new Proxy(function () { }, {
      apply: function (_, thisArg, args: any[] = []) {
        return invoke({ thisArg, args })
      },
      get(target: any, property: string) {
        if (property === 'apply') return target[property]
        return getProperty({ key: property })
      }
    })
  }
}
