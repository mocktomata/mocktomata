
import { isPromise } from './isPromise'
import { KomondorPlugin, SpyContext, StubContext } from '../../plugin';

export const promisePlugin: KomondorPlugin = {
  name: 'promise',
  support: isPromise,
  createSpy: getPromiseSpy,
  createStub: getPromiseStub,
  createReplayer(context, value) {
    const p = new Promise((a, r) => {
      replayer.on('return', (value: any) => a(value))
    })
    const replayer = context.newReplayer(p)

    return p
  }
}

function getPromiseSpy(context: SpyContext, subject: Promise<any>) {
  const recorder = context.newSpyRecorder(subject)
  const instance = recorder.construct()
  const call = instance.newCall()
  return subject.then(
    result => {
      return call.return(result, { state: 'fulfilled' })
    },
    err => {
      throw call.return(err, { state: 'rejected' })
    })
}

function getPromiseStub(context: StubContext) {
  const player = context.newStubRecorder()
  const instance = player.construct()
  const call = instance.newCall()
  return new Promise((resolve, reject) => {
    call.waitUntilReturn(() => {
      if (call.succeed({ state: 'fulfilled' })) {
        resolve(call.result())
      }
      else {
        reject(call.thrown())
      }
    })
  })
}
