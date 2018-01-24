import { SpecContext } from '../index'

export function getReturnSpy(context: SpecContext, subject) {
  if (!isPromise(subject)) return undefined
  return spyPromise(context, subject)
}

export function getReturnStub(context: SpecContext, type: string) {
  if (type !== 'promise') return undefined
  return stubPromise(context)
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

function spyPromise(context: SpecContext, result) {
  context.add({
    type: 'return',
    payload: {},
    meta: { type: 'promise' }
  })
  result.then(
    results => ({ type: 'promise', payload: results, meta: { type: 'resolve' } }),
    err => ({ type: 'promise', payload: err, meta: { type: 'reject' } })
  ).then(action => {
    context.add(action)
  }).then(() => context.complete())
  return result
}

function stubPromise(context: SpecContext) {
  const action = context.peek()
  if (action && action.type === 'promise') {
    context.next()
    context.complete()
    if (action.meta.type === 'resolve')
      return Promise.resolve(action.payload)
    else
      return Promise.reject(action.payload)
  }
}
