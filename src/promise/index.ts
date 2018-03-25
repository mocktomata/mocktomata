import { Registrar, ReturnAction, createScopedCreateExpectation, SpyContext, StubContext } from 'komondor-plugin'

const TYPE = 'promise'
const createSatisfier = createScopedCreateExpectation(TYPE)
export const resolvedWith = createSatisfier('resolve')
export const rejectedWith = createSatisfier('reject')

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
  return subject.then(
    result => {
      // return context.processReturn('promise/resolve', result)
      const action = context.add('promise/resolve', result)
      return context.getSpy(context, result, action) || result
    },
    err => {
      context.add('promise/reject', err)
      throw err
    })
}

function getPromiseStub(context: StubContext, action: ReturnAction) {
  return new Promise((resolve, reject) => {
    context.on('promise/resolve', a => {
      if (a.meta.id === action.meta.returnId) {
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
    context.on('promise/reject', a => {
      if (a.meta.id === action.meta.returnId) {
        context.next()
        reject(a.payload)
      }
    })
  })
}
