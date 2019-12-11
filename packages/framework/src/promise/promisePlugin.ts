
import { SpecPlugin } from '../spec';
import { isPromise } from './isPromise';

export const promisePlugin: SpecPlugin<Promise<any>, { state: 'fulfilled' | 'rejected' }> = {
  name: 'promise',
  support: isPromise,
  createSpy({ invoke, setMeta }, subject) {
    return subject.then(v => {
      setMeta(true)
      return invoke({
        performer: 'plugin',
        site: 'then',
        thisArg: undefined,
        args: [(_: any) => v]
      }, ({ args: [fn] }) => fn(v))
    }, v => {
      setMeta(false)
      return invoke({
        performer: 'plugin',
        site: 'then',
        thisArg: undefined,
        args: [undefined, (v: any) => { throw v }]
      }, ({ args: [_, fn] }) => fn!(v))
    })
  },
  createStub({ invoke }, _, meta) {
    return new Promise((resolve, reject) => invoke({
      performer: 'plugin',
      site: 'then',
      thisArg: undefined,
      args: meta ? [resolve] : [undefined, reject]
    }))
  }
}
