import { Registrar, createExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'
export const resolvedWith = createExpectation(TYPE, 'resolve')
export const rejectedWith = createExpectation(TYPE, 'reject')

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
      return call.return(result, { name: 'resolve' })
    },
    err => {
      throw call.throw(err, { name: 'reject' })
    })
}

function getPromiseStub(context: StubContext) {
  const call = context.newCall()
  return new Promise((resolve, reject) => {
    if (call.succeed({ name: 'resolve' })) {
      resolve(call.result())
    }
    else {
      reject(call.thrown())
    }
  })
}
