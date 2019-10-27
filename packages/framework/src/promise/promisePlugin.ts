
import { SpecPlugin } from '../spec';
import { isPromise } from './isPromise';

export const promisePlugin: SpecPlugin<Promise<any>, { state: 'fulfilled' | 'rejected' }> = {
  name: 'promise',
  support: isPromise,
  createSpy({ invoke, getSpy }, subject) {
    const spy = subject.then(
      result => {
        return call.returns(result, {
          processArgument: getSpy,
          meta: { state: 'fulfilled' }
        })
      },
      err => {
        throw call.returns(err, {
          processArgument: getSpy,
          meta: { state: 'rejected' }
        })
      })

    // This `invoke()` indicates that during simulation the `then()` will be invoked by the plugin.
    // So that the result we recorded will be passed to the simulated promise and returned to the caller.
    const call = invoke([], { site: ['then'], mode: 'plugin-invoked' })
    return spy
  },
  createStub({ invoke }, _subject, _meta) {
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
