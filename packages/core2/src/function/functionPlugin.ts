// import { reduceKey } from 'type-plus';
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
    return function (this: any, ...args: any[]) {
      // Assuming any functions or functions within object are callbacks to be called by the subject.
      const invocation = invoke(args, { transform: (id, arg) => getSpy(id, arg, { mode: 'autonomous' }) })
      try {
        const result = subject.apply(this, invocation.args)
        return invocation.returns(result, { transform: (id, result) => getSpy(id, result, { mode: 'passive' }) })
      }
      catch (err) {
        throw invocation.throws(err, { transform: (id, err) => getSpy(id, err, { mode: 'passive' }) })
      }
    }
  },
  createStub({ invoke, getSpy }, _meta) {
    return function (this: any, ...args: any[]) {
      // No transform. The creation of stub/imitator is handled by the framework.
      const invocation = invoke(args, { transform: (id, arg) => getSpy(id, arg) })
      const result = invocation.getResult()
      if (result.type === 'return') {
        return invocation.returns(result.value)
      }
      else {
        throw invocation.throws(result.value)
      }
    }
  },
}
