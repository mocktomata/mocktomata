import { test } from 'ava'

import { spec } from '../index'
import { setImmediate } from 'timers';

class Foo {
  constructor(public x) { }
  getValue() {
    return this.x
  }
}

test('simple class verify', async t => {
  const fooSpec = await spec(Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class save', async t => {
  const fooSpec = await spec(Foo, { id: 'class/simple', mode: 'save' })
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class verify', async t => {
  const fooSpec = await spec(Foo, { id: 'class/simple', mode: 'replay' })
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.is(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

class Boo extends Foo {
  getPlusOne() {
    return this.getValue() + 1
  }
}

test('extended class verify', async t => {
  const booSpec = await spec(Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class save', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'save' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class replay', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'replay' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not existing spec will spy instead (check log)', async t => {
  const booSpec = await spec(Boo, { id: 'class/notExist', mode: 'replay' })
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.is(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not matching spec will spy instead (check log)', async t => {
  const booSpec = await spec(Boo, { id: 'class/extend', mode: 'replay' })
  const boo = new booSpec.subject(2)
  const actual = boo.getPlusOne()

  t.is(actual, 3)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [2] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 3 }
  ])
})

class WithCallback {
  callback(cb) {
    setImmediate(() => {
      cb('called')
    })
  }
  justDo(x) {
    return x
  }
}

test('captures callbacks verify', async t => {
  const cbSpec = await spec(WithCallback)
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.is(v, 'called')
    })
    cb.callback(v => {
      t.is(v, 'called')
      a()
    })
  })

  await cbSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [1], meta: { name: 'justDo' } },
    { type: 'class/return', payload: 1 },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 1,
        callSite: 0
      }
    }
  ])
})

test('captures callbacks save', async t => {
  const cbSpec = await spec(WithCallback, { id: 'class/withCallback', mode: 'save' })
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.is(v, 'called')
    })
    cb.callback(v => {
      t.is(v, 'called')
      a()
    })
  })

  await cbSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [1], meta: { name: 'justDo' } },
    { type: 'class/return', payload: 1 },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 1,
        callSite: 0
      }
    }
  ])
})

test('captures callbacks replay', async t => {
  const cbSpec = await spec(WithCallback, { id: 'class/withCallback', mode: 'replay' })
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.is(v, 'called')
    })
    cb.callback(v => {
      t.is(v, 'called')
      a()
    })
  })

  await cbSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [1], meta: { name: 'justDo' } },
    { type: 'class/return', payload: 1 },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    { type: 'class/invoke', meta: { name: 'callback' } },
    { type: 'class/return' },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        invokeIndex: 1,
        callSite: 0
      }
    }
  ])
})

class WithPromise {
  increment(x) {
    return new Promise(a => {
      setImmediate(() => a(x + 1))
    })
  }
}

test('method returning promise should have result of promise saved in payload', async t => {
  const promiseSpec = await spec(WithPromise, { id: 'class/withPromise', mode: 'verify' })
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.is(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', payload: 4, meta: { status: 'resolve' } }
  ])
})

test('method returning promise should have result of promise saved in payload', async t => {
  const promiseSpec = await spec(WithPromise, { id: 'class/withPromise', mode: 'save' })
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.is(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', payload: 4, meta: { status: 'resolve' } }
  ])
})

test('method returning promise should have result of promise saved in payload', async t => {
  const promiseSpec = await spec(WithPromise, { id: 'class/withPromise', mode: 'replay' })
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.is(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', payload: 4, meta: { status: 'resolve' } }
  ])
})
