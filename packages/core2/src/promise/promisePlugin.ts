
import { SpecPlugin } from '../spec';
import { isPromise } from './isPromise';

export const promisePlugin: SpecPlugin<Promise<any>, { state: 'fulfilled' | 'rejected' }> = {
  name: 'promise',
  support: isPromise,
  createSpy({ id, invoke, getSpy }, subject) {
    const spy = subject.then(
      result => {
        return call.returns(result, {
          processArgument: (id, v) => getSpy(id, v),
          meta: { state: 'fulfilled' }
        })
      },
      err => {
        throw call.returns(err, {
          processArgument: (id, v) => getSpy(id, v),
          meta: { state: 'rejected' }
        })
      })

    // This `invoke()` indicates that during simulation the `then()` will be invoked by the plugin.
    // So that the result we recorded will be passed to the simulated promise and returned to the caller.
    const call = invoke(id, [], { site: ['then'], mode: 'plugin-invoked' })
    return spy
  },
  createStub({ id, invoke }, _subject, _meta) {
    return new Promise((resolve, reject) => {
      const call = invoke(id, [], { site: ['then'] })
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
