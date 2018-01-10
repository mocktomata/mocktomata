import { test } from 'ava'
import { createSatisfier } from 'satisfier'

import { createSpec } from './index'

function increment(x: number) { return x + 1 }


test('normal function gets return value', t => {
  // createSpec({
  //   name: 'increment',
  //   description: 'asdfdsaf',
  //   expectation: '',
  //   fn: increment
  // })
  const spec = createSpec('increment', increment, { persist: false })
  t.is(spec.spiedFn(1), 2)
  t.is(spec.calls[0].result, 2)
})

function callback(a, b, cb) {
  cb(++a, --b)
}

test('spec on callback function', t => {
  const spec = createSpec('callback', callback, { persist: false })
  spec.spiedFn(1, 2, (a, b) => {
    t.is(a, 2)
    t.is(b, 1)
  })
  const call = spec.calls[0]
  createSatisfier([1, 2]).test(call.arguments)
  return call.then(response => {
    t.is(response[0], 2)
    t.is(response[1], 1)
  })
})

function callbackOnLiterial(options) {
  options.success(++options.data)
}
test('spec on jquery style callback', t => {
  const spec = createSpec('callback-option', callbackOnLiterial, { persist: false })
  spec.spiedFn({
    data: 1,
    success: (result) => {
      t.is(result, 2)
    }
  })

  const call = spec.calls[0]
  return call.then(response => t.is(response[0], 2))
})

function promising(x) {
  return new Promise(a => a(++x))
}

test('spec on promise', t => {
  const spec = createSpec('promise', promising, { persist: false })
  // tslint:disable-next-line
  spec.spiedFn(1)
  const call = spec.calls[0]
  return call.then(response => t.is(response, 2))
})

test('persist by default', async t => {
  function write(id, records) {
    t.is(id, 'promise-persist')
    t.is(records[0].arguments[0], 1)
  }

  const spec = createSpec('promise-persist', promising, undefined, { write })
  await spec.spiedFn(1)
})
