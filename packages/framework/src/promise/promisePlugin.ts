
import { SpecPlugin } from '../spec';
import { isPromise } from './isPromise';

export const promisePlugin: SpecPlugin<Promise<any>, { state: 'fulfilled' | 'rejected' }> = {
  name: 'promise',
  support: isPromise,
  createSpy({ invoke }, subject) {
    return subject.then(value => {
      value
      // return invoke({ performer: 'plugin', thisArg: undefined, args: [] })
    }, err => {
      err
    })
    return invoke({ performer: 'plugin', thisArg: undefined, args: [], site: 'then' }, ({ setMeta }) => subject.then(
      result => {
        setMeta(true)
        return result
      },
      err => {
        setMeta(false)
        throw err
      }
    ))
    // const spy = subject.then(
    //   result => {
    //     return call.returns(result, {
    //       processArgument: getSpy,
    //       meta: { state: 'fulfilled' }
    //     })
    //   },
    //   err => {
    //     throw call.returns(err, {
    //       processArgument: getSpy,
    //       meta: { state: 'rejected' }
    //     })
    //   })

    // // This `invoke()` indicates that during simulation the `then()` will be invoked by the plugin.
    // // So that the result we recorded will be passed to the simulated promise and returned to the caller.
    // const call = invoke([], { site: ['then'], mode: 'plugin-invoked' })
    // return spy
  },
  createStub({ invoke }, _subject, _meta) {
    return new Promise((resolve, reject) => {
      return invoke({ site: 'then', performer: 'plugin' }, ({ meta, value }) => {
        if (meta) {
          resolve(value)
        }
        else {
          reject(value)
        }
      })
    })
  }
}
