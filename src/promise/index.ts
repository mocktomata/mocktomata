import { Registrar, createExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'
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
  const call = context.newCall()
  // return call.wait({ state: 'fulfilled' })
  return new Promise((resolve, reject) => {
    if (call.succeed({ state: 'fulfilled' })) {
      resolve(call.result())
    }
    else {
      reject(call.thrown())
    }
  })
}
