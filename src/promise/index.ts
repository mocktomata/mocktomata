import { Registrar, ReturnAction, createExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'
export const resolvedWith = createExpectation(TYPE, 'resolve')
export const rejectedWith = createExpectation(TYPE, 'reject')

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    isPromise,
    (context, subject) => getPromiseSpy(context, subject),
    // tslint:disable-next-line
    (context, _subject, action) => getPromiseStub(context, action!)
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

function getPromiseStub(context: StubContext, action: ReturnAction) {
  const call = context.newCall()
  return new Promise((resolve, reject) => {
    if (call.succeed({ name: 'resolve' })) {
      resolve(call.result())
    }
    else {
      reject(call.thrown())
    }

    context.on('promise', 'resolve', a => {
      if (a.meta.instancId === action.meta.returnInstanceId) {
        if (a.meta.returnType) {
          const stub = context.getStub(context, a)
          context.next()
          resolve(stub)
        }
        else {
          context.next()
          resolve(a.payload)
        }
      }
    })
    context.on('promise', 'reject', a => {
      if (a.meta.instanceId === action.meta.returnInstanceId) {
        context.next()
        reject(a.payload)
      }
    })
  })
}
