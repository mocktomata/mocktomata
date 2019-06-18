
import { isPromise } from './isPromise'
import { KomondorPlugin } from '../plugin';

export const promisePlugin: KomondorPlugin<Promise<any>> = {
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
      call.waitUntilReturn(() => {
        if (call.succeed({ state: 'fulfilled' })) {
          resolve(call.returns())
        }
        else {
          reject(call.returns())
        }
      })
    })
    const subjectPlayer = player.declare(stub)
    const call = subjectPlayer.invoke([])
    return stub
  }
}
