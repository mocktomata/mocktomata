import { test } from 'ava'

import { spec } from '../spec'

const promise = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
    return Promise.resolve(x + 1)
  },
  fail() {
    return Promise.reject({ message: 'fail' })
  }
}

test('promise verify', async t => {
  const speced = await spec(promise.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: 3, meta: { type: 'resolve' } }
      ])
    })
})

test('promise verify save', async t => {
  const speced = await spec(promise.success, { id: 'promise', mode: 'save' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: 3, meta: { type: 'resolve' } }
      ])
    })
})

test('promise verify replay', async t => {
  const speced = await spec(promise.success, { id: 'promise', mode: 'replay' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: 3, meta: { type: 'resolve' } }
      ])
    })
})

test('promise rejected verify', async t => {
  const speced = await spec(promise.fail)
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { type: 'reject' } }
      ])
    })
})

test('promise rejected save', async t => {
  const speced = await spec(promise.fail, { id: 'promise fail', mode: 'save' })
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { type: 'reject' } }
      ])
    })
})

test('promise rejected replay', async t => {
  const speced = await spec(promise.fail, { id: 'promise fail', mode: 'replay' })
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'invoke', payload: ['increment', 2] },
        { type: 'return', payload: {}, meta: { type: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { type: 'reject' } }
      ])
    })
})
