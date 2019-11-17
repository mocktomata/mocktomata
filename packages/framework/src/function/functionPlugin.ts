import { SpecPlugin } from '../spec';
import { getPropertyNames, hasPropertyInPrototype } from '../utils';

export const functionPlugin: SpecPlugin<Function, Record<string, any>> = {
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
  createSpy: ({ invoke, getSpy, getProperty }, subject: any) => {
    return new Proxy(function () { }, {
      apply(_, thisArg, args?: any[]) {
        // set to autonomous mode assuming any functions or functions within object are callbacks to be called by the subject.
        const spiedArgs = args ? args.map(arg => getSpy(arg, { mode: 'autonomous' })) : []
        const invocation = invoke(spiedArgs)
        try {
          const result = subject.apply(thisArg, spiedArgs)
          return invocation.returns(getSpy(result, { mode: 'passive' }))
        }
        catch (err) {
          throw invocation.throws(getSpy(err, { mode: 'passive' }))
        }
      },
      get(_: any, property: string) {
        if (getPropertyNames(subject).indexOf(property) === -1) return undefined
        return getProperty(property, getSpy(subject[property]))
      }
    })
  },
  createStub({ invoke, getSpy, getProperty }, subject: any, meta) {
    return new Proxy(function () { }, {
      apply: function (_target, _thisArg, argumentsList) {
        // No transform. The creation of stub/imitator is handled by the framework.
        const invocation = invoke(argumentsList, { processArguments: getSpy })
        const result = invocation.getResult()
        if (result.type === 'return') {
          return invocation.returns(result.value)
        }
        else {
          throw invocation.throws(result.value)
        }
      },
      get(_, property: string) {
        return getProperty(property)
      }
    })
  },
  // metarize({ metarize }, spy) {
  //   return reduceKey(spy, (p, v) => {
  //     p[v] = metarize(spy[v])
  //     return p
  //   }, {} as any)
  // }
}
