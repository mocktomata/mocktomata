
import { isPromise } from './isPromise'
import { SpecPlugin } from '../spec';

export const promisePlugin: SpecPlugin<Promise<any>> = {
  name: 'promise',
  support: isPromise,
  createSpy({ recorder }, subject) {
    const subjectRecorder = recorder.declare(subject)

    // This is a bit off, but seen as a special case for Promise.
    // For Promise, we know we only interested in the `then()` function,
    // when the `invoke()` statement indicates that "we" have invoked the `then()`
    // and wait for the callback to be called.
    const call = subjectRecorder.invoke([])
    return subject.then(
      result => {
        return call.returns(result, { state: 'fulfilled' })
      },
      err => {
        throw call.returns(err, { state: 'rejected' })
      })
  },
  createStub({ player }) {
    const stub = new Promise((resolve, reject) => {
      call.waitUntilConclude(() => {
        const result = call.getResult()
        if (result.type === 'return') {
          if (result.meta!.state === 'fulfilled') {
            resolve(result.payload)
          }
          else {
            reject(result.payload)
          }
        }
      })
    })
    const call = player.declare(stub).invoke([])
    return stub
  }
}
