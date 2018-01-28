import { SpecContext, SpecAction, ReturnAction, SpecPluginUtil, KomondorRegistrar } from '../index'

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
  return stubPromise(context)
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

function spyPromise(context: SpecContext, subject, action) {
  action.meta.returnType = 'promise'
  return subject.then(
    result => {
      const action: any = {
        type: 'promise',
        meta: {
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
      context.add({ type: 'promise', payload: err, meta: { status: 'reject' } })
      throw err
    })
}

function stubPromise(context: SpecContext) {
  const action = context.peek()
  return (action && action.type === 'promise' ?
    Promise.resolve(action) :
    new Promise<SpecAction>(a => {
      context.on('promise', action => a(action))
    }))
    .then(action => {
      context.next()
      if (action.meta.status === 'resolve') {
        if (action.meta.returnType) {
          return Promise.resolve(komondor.getReturnStub(context, action))
        }
        return Promise.resolve(action.payload)
      }
      else
        return Promise.reject(action.payload)
    })
}
