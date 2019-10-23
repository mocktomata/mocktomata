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
  createSpy: ({ id, invoke, getSpy }, subject) => {
    return Object.assign(function (this: any, ...args: any[]) {
      // Assuming any functions or functions within object are callbacks to be called by the subject.
      const invocation = invoke(id, args, { processArguments: arg => getSpy(arg, { mode: 'autonomous' }) })
      try {
        const result = subject.apply(this, invocation.args)
        return invocation.returns(result, { processArgument: result => getSpy(result, { mode: 'passive' }) })
      }
      catch (err) {
        throw invocation.throws(err, { processArgument: err => getSpy(err, { mode: 'passive' }) })
      }
    }, reduceKey(subject, (p, v) => {
      p[v] = getSpy(subject[v])
      return p
    }, {} as any))
  },
  createStub({ id, invoke, getSpy }, _subject, meta) {
    return Object.assign(function (this: any, ...args: any[]) {
      // No transform. The creation of stub/imitator is handled by the framework.
      const invocation = invoke(id, args, { processArguments: getSpy })
      const result = invocation.getResult()
      if (result.type === 'return') {
        return invocation.returns(result.value)
      }
      else {
        throw invocation.throws(result.value)
      }
    }, reduceKey(meta, (p, v) => {
      p[v] = getSpy(meta[v])
      return p
    }, {} as any))
  },
  metarize({ metarize }, spy) {
    return reduceKey(spy, (p, v) => {
      p[v] = metarize(spy[v])
      return p
    }, {} as any)
  }
}
