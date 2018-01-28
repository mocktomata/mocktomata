import { SpecContext, ReturnAction, SpecPluginUtil, KomondorRegistrar } from '../index'

let komondor: SpecPluginUtil
export function activate(registrar: KomondorRegistrar, util: SpecPluginUtil) {
  komondor = util
  registrar.registerGetReturnSpy(getReturnSpy)
  registrar.registerGetReturnStub(getReturnStub)
}
function getReturnSpy(context: SpecContext, subject, scope) {
  if (!isPromise(subject)) return undefined
  return spyPromise(context, subject, scope)
}

function getReturnStub(context: SpecContext, action: ReturnAction) {
  if (action.meta.returnType !== 'promise') return undefined
  return stubPromise(context, action)
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

let counter = 0

function spyPromise(context: SpecContext, subject, action) {
  const promiseId = ++counter
  action.meta.returnType = 'promise'
  action.meta.promiseId = promiseId
  return subject.then(
    result => {
      const action: any = {
        type: 'promise',
        meta: {
          promiseId,
          status: 'resolve'
        }
      }

      context.add(action)

      const spied = komondor.getReturnSpy(context, result, action)
      if (spied) {
        return spied
      }
      else {
        action.payload = result
        return result
      }
    },
    err => {
      context.add({
        type: 'promise',
        payload: err,
        meta: {
          promiseId,
          status: 'reject'
        }
      })
      throw err
    })
}

function stubPromise(context: SpecContext, action: ReturnAction) {
  return new Promise((resolve, reject) => {
    context.on('promise', a => {
      if (a.meta.promiseId === action.meta.promiseId) {
        if (a.meta.status === 'resolve') {
          if (a.meta.returnType) {
            const stub = komondor.getReturnStub(context, a)
            context.next()
            resolve(stub)
          }
          else {
            context.next()
            resolve(a.payload)
          }
        }
        else {
          context.next()
          reject(a.payload)
        }
      }
    })
  })
}
