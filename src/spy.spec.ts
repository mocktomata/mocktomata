import { test } from 'ava'

import { spy, spyAsync } from './index'

function increment(x: number) { return ++x }

test('spy on function returns a working function', t => {
  const spyFoo = spy(increment)

  t.is(spyFoo(1), 2)
})

test('record argument and result', t => {
  const actual = spy(increment)

  actual(1)

  t.is(actual.calls.length, 1)
  const cr = actual.calls[0]
  t.is(cr.arguments[0], 1)
  t.is(cr.result, 2)
})

function throws() { throw new Error('thrown') }

test('capture error', t => {
  const actual = spy(throws)

  t.throws(() => actual())

  t.is(actual.calls.length, 1)
  const cr = actual.calls[0]
  t.truthy(cr.error)
})

// this is not a valid test as the package is used for boundary testing.
// Boundary function are not expected to make changes to the arguments
test.skip('argument should be immutable', t => {
  function mutate(x) { x.a++ }
  const actual = spy(mutate)
  actual({ a: 1 })
  const cr = actual.calls[0]
  t.is(cr.arguments[0].a, 1)
})

function invoke(x, cb) { cb(x) }

test('callback are spied', t => {
  const actual = spy(invoke)
  actual(1, x => t.is(x, 1))
  const cr = actual.calls[0]
  t.is(cr.arguments[0], 1)
  t.is(cr.arguments[1].calls[0].arguments[0], 1)
})

const resolve = x => Promise.resolve(x)

test('then() will receive result from promise', t => {
  const spied = spyAsync(resolve)
  // tslint:disable-next-line
  spied(1)
  return spied.calls[0].then(x => t.is(x, 1))
})

test('result from promise can be retrieved from await on the call', async t => {
  const spied = spyAsync(resolve)
  // tslint:disable-next-line
  spied(1)
  t.is(await spied.calls[0], 1)
})

const reject = x => Promise.reject(x)

test('throws() will receive error thrown by promise', t => {
  const spied = spyAsync(reject)
  // tslint:disable-next-line
  spied(1)
  return spied.calls[0].throws(x => t.is(x, 1))
})

test('error result is received on catch block', async t => {
  const spied = spyAsync(reject)
  try {
    await spied(1)
  }
  catch (x) {
    t.is(x, 1)
  }
})
