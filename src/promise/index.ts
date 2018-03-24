import { Registrar, ReturnAction, SpecContext, createScopedCreateExpectation } from 'komondor-plugin'

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

function getPromiseSpy(context: SpecContext, subject) {
  return subject.then(
    result => {
      const action = context.add('promise/resolve')
      const spied = context.getSpy(context, result, action)
      if (spied) {
        action.payload = spied
        return spied
      }
      else {
        action.payload = result
        return result
      }
    },
    err => {
      context.add('promise/reject', err)
      throw err
    })
}

function getPromiseStub(context: SpecContext, action: ReturnAction) {
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
