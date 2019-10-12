
import { isPromise } from './isPromise'
import { SpecPlugin } from '../spec';

export const promisePlugin: SpecPlugin<Promise<any>> = {
  name: 'promise',
  support: isPromise,
  createSpy({ recorder }, subject) {
    const spy = subject.then(
      result => {
        return call.returns(result, { meta: { state: 'fulfilled' } })
      },
      err => {
        throw call.returns(err, { meta: { state: 'rejected' } })
      })

    const subjectRecorder = recorder.declare(spy)

    // This is a bit off, but seen as a special case for Promise.
    // For Promise, we know we only interested in the `then()` function,
    // when the `invoke()` statement indicates that "we" have invoked the `then()`
    // and wait for the callback to be called.
    const call = subjectRecorder.invoke([])
    return spy
  },
  createStub({ recorder: player }) {
    const declaration = player.declare()
    const call = declaration.invoke([])
    const stub = new Promise((resolve, reject) => {
      call.waitUntilConclude(() => {
        const result = call.getResult()
        if (result.type === 'return') {
          if (result.meta!.state === 'fulfilled') {
            resolve(call.returns(result.payload))
          }
          else {
            reject(call.returns(result.payload))
          }
        }
      })
    })
    declaration.setTarget(stub)
    return stub
  }
}
