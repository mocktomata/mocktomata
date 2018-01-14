import { test } from 'ava'

import { spy } from './spy'

function increment(x: number) { return ++x }

test('record argument and result', t => {
  const { fn, calls } = spy(increment)

  t.is(fn(1), 2)

  t.is(calls.length, 1)
  const cr = calls[0]
  t.is(cr.inputs[0], 1)
  t.is(cr.output, 2)
})

test('tersify for sync call', async t => {
  const { fn, calls } = spy(increment)

  t.is(fn(1), 2)
  const record = await calls[0].getCallRecord()
  t.is(record.tersify(), `{ inputs: [1], output: 2 }`)
})

function throws() { throw new Error('thrown') }

test('capture error', t => {
  const { fn, calls } = spy(throws)

  const err = t.throws(fn)

  t.is(calls.length, 1)
  t.is(calls[0].error, err)
})

test('tersify for throws call', async t => {
  const { fn, calls } = spy(throws)

  t.throws(fn)

  const record = await calls[0].getCallRecord()
  t.is(record.tersify(), `{ inputs: [], error: { message: 'thrown' } }`)
})

// this is not a valid test as the package is used for boundary testing.
// Boundary function are not expected to make changes to the arguments
test.skip('argument should be immutable', t => {
  function mutate(x) { x.a++ }
  const { fn, calls } = spy(mutate)
  fn({ a: 1 })
  const entry = calls[0]
  t.is(entry.inputs[0].a, 1)
})

function callback(x, cb) { cb(x) }

test('callback are spied', async t => {
  const { fn, calls } = spy(callback)
  fn(1, x => t.is(x, 1))
  const entry = calls[0]
  t.is(entry.inputs[0], 1)
  return entry.then(x => t.deepEqual(x, [1]))
})

test('tersify for callback', async t => {
  const { fn, calls } = spy(callback)

  fn(1, x => t.is(x, 1))

  const record = await calls[0].getCallRecord()
  t.is(record.tersify(), `{ inputs: [1, callback], asyncOutput: [1] }`)
})

function callbackLiteral(options) {
  options.success(options.data + 1)
}

test('spec on jquery style callback', async t => {
  const { fn, calls } = spy(callbackLiteral)
  fn({
    data: 1,
    fail: () => {
      t.fail('fail callback should not be called')
    },
    success: (result) => {
      t.is(result, 2)
    }
  })

  const entry = calls[0]
  const output = await entry
  t.is(output[0], 2)
  const record = await entry.getCallRecord()
  t.is(record.invokedCallback, 'success')
})

test('tersify for callback', async t => {
  const { fn, calls } = spy(callbackLiteral)
  fn({
    data: 1,
    success: (result) => {
      t.is(result, 2)
    }
  })
  const record = await calls[0].getCallRecord()
  t.is(record.tersify(), `{ inputs: [{ data: 1, success: callback }], invokedCallback: 'success', asyncOutput: [2] }`)
})

function callbackLiteralFail(options) {
  options.fail(options.data + 1)
}

test('spec on jquery style callback failing', async t => {
  const { fn, calls } = spy(callbackLiteralFail)
  fn({
    data: 1,
    success: () => {
      t.fail('success callback should not be called')
    },
    fail: (result) => {
      t.is(result, 2)
    }
  })

  const entry = calls[0]
  const output = await entry
  t.is(output[0], 2)
  const record = await entry.getCallRecord()
  t.is(record.invokedCallback, 'fail')
})

test('tersify for failing callback for object literal input', async t => {
  const { fn, calls } = spy(callbackLiteralFail)
  fn({
    data: 1,
    success: () => {
      t.fail('success callback should not be called')
    },
    fail: (result) => {
      t.is(result, 2)
    }
  })
  const record = await calls[0].getCallRecord()
  t.is(record.tersify(), `{ inputs: [{ data: 1, success: callback, fail: callback }], invokedCallback: 'fail', asyncOutput: [2] }`)
})

const resolve = x => Promise.resolve(x)

test('then() will receive result from promise', async t => {
  const { fn, calls } = spy(resolve)
  // tslint:disable-next-line
  fn(1)
  return calls[0].then(actual => {
    t.is(actual, 1)
  })
})

test('result from promise can be retrieved from await on the call', async t => {
  const { fn, calls } = spy(resolve)
  // tslint:disable-next-line
  fn(1)
  t.is(await calls[0], 1)
})

const reject = x => Promise.reject(new Error(x))

test('catch() will receive error thrown by promise', async t => {
  const { fn, calls } = spy(reject)
  // tslint:disable-next-line
  return fn(1).catch(actualError => {
    return calls[0].catch(err => {
      t.is(err, actualError)
    })
  })
})

test('tersify for resolve call', async t => {
  const { fn, calls } = spy(resolve)
  // tslint:disable-next-line
  fn(1)
  return calls[0].getCallRecord()
    .then(record => {
      t.is(record.tersify(), `{ inputs: [1], output: {}, asyncOutput: 1 }`)
    })
})


test('tersify for reject call', async t => {
  const { fn, calls } = spy(reject)
  return fn(1).catch(() => {
    return calls[0].getCallRecord()
      .then(record => {
        t.is(record.tersify(), `{ inputs: [1], output: {}, asyncError: { message: '1' } }`)
      })
  })
})
