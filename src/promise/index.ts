import { SpecContext, SpecAction, ReturnAction } from '../index'

export function getReturnSpy(context: SpecContext, subject, scope) {
  if (!isPromise(subject)) return undefined
  return spyPromise(context, subject, scope)
}

export function getReturnStub(context: SpecContext, action: ReturnAction) {
  if (action.meta.returnType !== 'promise') return undefined
  return stubPromise(context)
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

function spyPromise(context: SpecContext, result, scope) {
  context.add({
    type: `${scope}/return`,
    payload: {},
    meta: { returnType: 'promise' }
  })
  return result.then(
    results => {
      context.add({ type: 'promise', payload: results, meta: { status: 'resolve' } })
      return results
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
      if (action.meta.status === 'resolve')
        return Promise.resolve(action.payload)
      else
        return Promise.reject(action.payload)
    })
}
