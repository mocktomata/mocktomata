import { test } from 'ava'

import { spec } from '../spec'
import { setTimeout } from 'timers';

const promise = {
  increment(remote, x) {
    return remote('increment', x)
  },
  success(_url, x) {
    return Promise.resolve(x + 1)
  },
  fail() {
    return Promise.reject(new Error('fail'))
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
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: 3, meta: { status: 'resolve' } }
      ])
    })
})

test('promise verify save', async t => {
  const speced = await spec(promise.success, { id: 'promise/resolve', mode: 'save' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: 3, meta: { status: 'resolve' } }
      ])
    })
})

test('promise verify replay', async t => {
  const speced = await spec(promise.success, { id: 'promise/resolve', mode: 'replay' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: 3, meta: { status: 'resolve' } }
      ])
    })
})

test('promise rejected verify', async t => {
  const speced = await spec(promise.fail)
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { status: 'reject' } }
      ])
    })
})

test('promise rejected save', async t => {
  const speced = await spec(promise.fail, { id: 'promise/reject', mode: 'save' })
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { status: 'reject' } }
      ])
    })
})

test('promise rejected replay', async t => {
  const speced = await spec(promise.fail, { id: 'promise/reject', mode: 'replay' })
  return promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['increment', 2] },
        { type: 'fn/return', payload: {}, meta: { returnType: 'promise' } },
        { type: 'promise', payload: { message: 'fail' }, meta: { status: 'reject' } }
      ])
    })
})

test('promise with callback in between', async t => {
  function foo(x, cb) {
    return new Promise(a => {
      setTimeout(() => {
        cb('called')
        a(x + 1)
      }, 10)
    })
  }
  const fooSpec = await spec(foo);

  let fooing
  return new Promise(a => {
    fooing = fooSpec.subject(2, msg => {
      t.is(msg, 'called')
      a()
    })
  })
    .then(() => fooing)
    .then(actual => {
      t.is(actual, 3)
      return fooSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'fn/callback', payload: ['called'] },
        { type: 'promise', payload: 3, meta: { status: 'resolve' } }
      ])
    })
})
