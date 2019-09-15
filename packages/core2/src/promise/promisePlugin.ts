
import { isPromise } from './isPromise'
import { SpecPlugin } from '../spec';

export const promisePlugin: SpecPlugin<Promise<any>> = {
  name: 'promise',
  support: isPromise,
  createSpy({ invoke }, subject) {
    const spy = subject.then(
      result => {
        return call.returns(result, { meta: { state: 'fulfilled' } })
      },
      err => {
        throw call.returns(err, { meta: { state: 'rejected' } })
      })

    // This is a bit off, but seen as a special case for Promise.
    // For Promise, we know we only interested in the `then()` function,
    // when the `invoke()` statement indicates that "we" have invoked the `then()`
    // and wait for the callback to be called.
    const call = invoke([])
    return spy
  },
  createStub({ invoke }, _meta) {
    return new Promise((resolve, reject) => {
      const call = invoke([])
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
