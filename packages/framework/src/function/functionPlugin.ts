import { SpecPlugin } from '../spec';
import { hasProperty, hasPropertyInPrototype } from '../utils';

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
  createSpy: ({ invoke, getProperty }, subject: any) => {
    return new Proxy(function () { }, {
      apply(_, thisArg, args: any[] = []) {
        return invoke(({ withThisArg, withArgs }) => {
          const spiedArgs = withArgs(args)
          return subject.apply(withThisArg(thisArg), spiedArgs)
        })
      },
      get(_: any, property: string) {
        if (!hasProperty(subject, property)) return undefined
        return getProperty([property], () => subject[property])
      },
      set(_, property: string, value: any) {
        return subject[property] = value
      }
    })
  },
  createStub({ invoke, getProperty }, _subject, _meta) {
    return new Proxy(function () { }, {
      apply: function (_target, thisArg, args: any[] = []) {
        return invoke(({ getSpy, withArgs, withThisArg, getResult }) => {
          const spiedArgs = args ? args.map(arg => getSpy(arg, { mode: 'autonomous' })) : []
          withArgs(spiedArgs)
          withThisArg(thisArg)
          try {
            return getSpy(getResult(), { mode: 'passive' })
          }
          catch (err) {
            throw getSpy(err, { mode: 'passive' })
          }
        })
        // const invocation = invoke(argumentsList.map(arg => getSpy(arg)))
        // const result = invocation.getResult()
        // if (result.type === 'return') {
        //   return invocation.returns(result.value)
        // }
        // else {
        //   throw invocation.throws(result.value)
        // }
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
