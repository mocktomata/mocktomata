import { Registrar, createExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'
export const promiseResolvedWith = createExpectation(TYPE, 'return', { status: 'resolve' })
export const promiseRejectedWith = createExpectation(TYPE, 'throw', { status: 'reject' })

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
  const call = context.newCall()
  return subject.then(
    result => {
      return call.return(result, { status: 'resolve' })
    },
    err => {
      throw call.return(err, { status: 'reject' })
    })
}

function getPromiseStub(context: StubContext) {
  const call = context.newCall()
  return new Promise((resolve, reject) => {
    if (call.succeed({ status: 'resolve' })) {
      resolve(call.result())
    }
    else {
      reject(call.thrown())
    }
  })
}
