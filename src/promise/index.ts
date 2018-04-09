import { Registrar, createExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'

export function promiseConstructed() {
  return { type: TYPE, name: 'construct' }
}
export const promiseResolved = createExpectation(TYPE, 'return', { state: 'fulfilled' })
export const promiseRejected = createExpectation(TYPE, 'return', { state: 'rejected' })

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    isPromise,
    getPromiseSpy,
    getPromiseStub
  )
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

function getPromiseSpy(context: SpyContext, subject) {
  const instance = context.newInstance()
  instance.construct()
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
  const instance = context.newInstance()
  instance.constructed()
  const call = instance.newCall()
  return new Promise((resolve, reject) => {
    // call.on({ state: 'fulfilled' }, () => {
    //   if (call.succeed({ state: 'fulfilled' })) {
    //     resolve(call.result())
    //   }
    //   else {
    //     reject(call.thrown())
    //   }
    // })
    if (call.succeed({ state: 'fulfilled' })) {
      resolve(call.result())
    }
    else {
      reject(call.thrown())
    }
  })
}
