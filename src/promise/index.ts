import { SpecStore } from '../specStore'

export function getReturnSpy({ resolve, store }, subject) {
  if (!isPromise(subject)) return undefined
  return spyOnPromise({ resolve, store }, subject)
}

export function getReturnStub({ store, resolve }: { store: SpecStore, resolve: any }, type: string) {
  if (type !== 'promise') return undefined
  return promiseStub({ store, resolve })
}

function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}

function spyOnPromise({ store, resolve }, result) {
  store.add({
    type: 'return',
    payload: {},
    meta: { type: 'promise' }
  })
  result.then(
    results => ({ type: 'promise', payload: results, meta: { type: 'resolve' } }),
    err => ({ type: 'promise', payload: err, meta: { type: 'reject' } })
  ).then(action => {
    store.add(action)
  }).then(() => resolve())
  return result
}

function promiseStub({ store, resolve }: { store: SpecStore, resolve: any }) {
  const action = store.peek()
  if (action.type === 'promise') {
    store.next()
    resolve()
    if (action.meta.type === 'resolve')
      return Promise.resolve(action.payload)
    else
      return Promise.reject(action.payload)
  }
}
