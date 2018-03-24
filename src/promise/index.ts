import { PluginUtil, Registrar, ReturnAction, SpecContext, createScopedCreateAction, createScopedCreateExpectation } from 'komondor-plugin'

const TYPE = 'promise'
const createAction = createScopedCreateAction(TYPE)
const createSatisfier = createScopedCreateExpectation(TYPE)
export const resolvedWith = createSatisfier('resolve')
export const rejectedWith = createSatisfier('reject')

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    isPromise,
    (context, subject, action) => getPromiseSpy(context, registrar.util, subject, action),
    // tslint:disable-next-line
    (context, _subject, action) => getPromiseStub(context, registrar.util, action!)
  )
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

let counter = 0
function getPromiseSpy(context: SpecContext, util: PluginUtil, subject, action: ReturnAction | undefined) {
  const promiseId = ++counter
  if (action) {
    action.meta.returnType = TYPE
    action.meta.promiseId = promiseId
  }
  return subject.then(
    result => {
      const action = createAction('resolve', undefined, { promiseId })

      context.add(action)
      const spied = util.getSpy(context, result, action)
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
      context.add(createAction('reject', err, { promiseId }))
      throw err
    })
}

function getPromiseStub(context: SpecContext, util: PluginUtil, action: ReturnAction) {
  return new Promise((resolve, reject) => {
    context.on('promise/resolve', a => {
      if (a.meta.promiseId === action.meta.promiseId) {
        if (a.meta.returnType) {
          const stub = util.getStub(context, a)
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
      if (a.meta.promiseId === action.meta.promiseId) {
        context.next()
        reject(a.payload)
      }
    })
  })
}
