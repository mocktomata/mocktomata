
import { SpecPlugin } from '../spec';
import { isPromise } from './isPromise';

export const promisePlugin: SpecPlugin<Promise<any>, { state: 'fulfilled' | 'rejected' }> = {
  name: 'promise',
  support: isPromise,
  createSpy({ invoke, getSpy }, subject) {
    const spy = subject.then(
      result => {
        return call.returns(result, {
          transform: v => getSpy(v),
          meta: { state: 'fulfilled' }
        })
      },
      err => {
        throw call.returns(err, {
          transform: v => getSpy(v),
          meta: { state: 'rejected' }
        })
      })

    // This `invoke()` indicates that during simulation the `then()` will be invoked by the plugin.
    // So that the result we recorded will be passed to the simulated promise and returned to the caller.
    const call = invoke([], { site: ['then'], mode: 'plugin-invoked' })
    return spy
  },
  // createSpy({ invoke, getSpy }, subject) {
  //   let fulfilled: boolean | undefined = undefined
  //   let result: any
  //   const onfulfills: Array<{ recorder: InvocationRecorder, fn: (value: any) => void }> = []
  //   const onrejects: Array<{ recorder: InvocationRecorder, fn: (value: any) => void }> = []
  //   const onfinals: Array<{ recorder: InvocationRecorder, fn: (value: any) => void }> = []

  //   subject.then(value => {
  //     fulfilled = true
  //     result = value
  //   }, value => {
  //     fulfilled = false
  //     result = value
  //   }).finally(processResult)

  //   function processResult() {
  //     if (fulfilled === undefined) return

  //     if (fulfilled) {
  //       while (onfulfills.length > 0) {
  //         const { recorder, fn } = onfulfills.shift()!
  //         fn(recorder.returns(result, { transform: getSpy }))
  //       }
  //     }
  //     else {
  //       while (onrejects.length > 0) {
  //         const { recorder, fn } = onrejects.shift()!
  //         fn(recorder.returns(result, { transform: getSpy }))
  //       }
  //     }

  //     while (onfinals.length > 0) {
  //       const { recorder, fn } = onfinals.shift()!
  //       fn(recorder.returns(result, { transform: getSpy }))
  //     }
  //   }
  //   return {
  //     [Symbol.toStringTag]: subject[Symbol.toStringTag],
  //     then(onfulfilled, onrejected) {
  //       const recorder = invoke([onfulfilled, onrejected], { site: ['then'], transform: getSpy })
  //       if (onfulfilled) onfulfills.push({ recorder, fn: onfulfilled })
  //       if (onrejected) onrejects.push({ recorder, fn: onrejected })
  //       processResult()
  //       return this
  //     },
  //     catch(onrejected) {
  //       const recorder = invoke([onrejected], { site: ['catch'], transform: getSpy })
  //       if (onrejected) onrejects.push({ recorder, fn: onrejected })
  //       processResult()
  //       return this
  //     },
  //     finally(onfinally) {
  //       const recorder = invoke([onfinally], { site: ['finally'], transform: getSpy })
  //       if (onfinally) onfinals.push({ recorder, fn: onfinally })
  //       processResult()
  //       return this
  //     }
  //   }
  // },
  createStub({ invoke }, _meta) {
    return new Promise((resolve, reject) => {
      const call = invoke([], { site: ['then'] })
      call.getResultAsync().then(result => {
        if (result.type === 'return') {
          if (result.meta!.state === 'fulfilled') {
            resolve(call.returns(result.value))
          }
          else {
            reject(call.returns(result.value))
          }
        }
      })
    })
  }
}
