// import { reduceKey } from 'type-plus';
import { reduceKey } from 'type-plus';
import { SpecPlugin } from '../spec';
import { hasPropertyInPrototype } from '../utils';

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
  createSpy: ({ invoke, getSpy }, subject) => {
    return new Proxy(function () { }, {
      apply(_, thisArg, argumentsList) {
        // Assuming any functions or functions within object are callbacks to be called by the subject.
        const invocation = invoke(argumentsList, { processArguments: arg => getSpy(arg, { mode: 'autonomous' }) })
        try {
          const result = subject.apply(thisArg, invocation.args)
          return invocation.returns(result, { processArgument: result => getSpy(result, { mode: 'passive' }) })
        }
        catch (err) {
          throw invocation.throws(err, { processArgument: err => getSpy(err, { mode: 'passive' }) })
        }
      },
      get(_: any, property: string) {
        if (Object.getOwnPropertyNames(subject).indexOf(property) === -1) return (subject as any)[property]
        return getSpy((subject as any)[property], { site: [property] })
      }
    })
  },
  createStub({ invoke, getSpy, resolve }, subject: any, meta) {
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
        if (Object.keys(meta).indexOf(property) >= 0)
          return resolve(meta[property], { site: [property] })
        if (!subject || !subject[property]) return undefined
        return getSpy((subject as any)[property], { site: [property] })
      }
    })
  },
  metarize({ metarize }, spy) {
    return reduceKey(spy, (p, v) => {
      p[v] = metarize(spy[v])
      return p
    }, {} as any)
  }
}
