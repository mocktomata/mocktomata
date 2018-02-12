import { test } from 'ava'
import stream = require('stream')
import { setTimeout, setImmediate } from 'timers'

import { spec } from '../index'

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

const noReturn = {
  doSomething(remote) {
    return remote()
  },
  success() {
    return Promise.resolve()
  }
}

test('live with noReturn', async () => {
  const noReturnSpec = await spec(noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise', meta: { status: 'resolve' } }
      ])
    })
})

test('save with noReturn', async () => {
  const noReturnSpec = await spec.save('promise/noReturn', noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise', meta: { status: 'resolve' } }
      ])
    })
})

test('simulate with noReturn', async () => {
  const noReturnSpec = await spec.simulate('promise/noReturn', noReturn.success)
  return noReturn.doSomething(noReturnSpec.subject)
    .then(() => {
      return noReturnSpec.satisfy([
        { type: 'fn/invoke' },
        { type: 'fn/return', meta: { returnType: 'promise' } },
        { type: 'promise', meta: { status: 'resolve' } }
      ])
    })
})

test('promise live', async t => {
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
  const speced = await spec.save('promise/resolve', promise.success)
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
  const speced = await spec.simulate('promise/resolve', promise.success)
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
  const speced = await spec.save('promise/reject', promise.fail)
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

test('promise rejected simulate', async t => {
  const speced = await spec.simulate('promise/reject', promise.fail)
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

function promiseStream() {
  function readStream(): stream.Stream {
    const rs = new stream.Readable()
    const message = 'hello world'
    let i = 0
    rs._read = function () {
      if (message[i])
        rs.push(message[i++])
      else
        rs.push(null)
    }
    return rs
  }
  const read = readStream()
  return new Promise<stream.Stream>(a => {
    setImmediate(() => {
      a(read)
    })
  })
}

test('promise returning a stream', async t => {
  const target = await spec(promiseStream)
  const read = await target.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
    t.pass()
  })
  t.is(actual, 'hello world')

  await target.satisfy([
    undefined,
    undefined,
    { type: 'promise', meta: { returnType: 'stream', status: 'resolve' } },
    { type: 'stream', meta: { length: 11 } }
  ])
})

test('promise returning a stream (save)', async t => {
  const target = await spec.save('promise/readStream', promiseStream)
  const read = await target.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
    t.pass()
  })
  t.is(actual, 'hello world')

  await target.satisfy([
    undefined,
    undefined,
    { type: 'promise', meta: { returnType: 'stream', status: 'resolve' } },
    { type: 'stream', meta: { length: 11 } }
  ])
})

test('promise returning a stream (simulate)', async t => {
  // this test uses `readStreamReplay` as source because it causes concurrency issue with the `save` test.
  // It doesn't happen in actual usage as there should be only one test accessing one spec file.
  const target = await spec.simulate('promise/readStreamReplay', promiseStream)
  const read = await target.subject()
  const actual = await new Promise(a => {
    let message = ''
    read.on('data', m => {
      message += m
    })
    read.on('end', () => {
      a(message)
    })
    t.pass()
  })
  t.is(actual, 'hello world')

  await target.satisfy([
    undefined,
    undefined,
    { type: 'promise', meta: { returnType: 'stream', status: 'resolve' } },
    { type: 'stream', meta: { length: 11 } }
  ])
})
