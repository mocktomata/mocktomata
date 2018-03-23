import t from 'assert'
import a from 'assertron'
import { setImmediate } from 'timers'

import { spec, SimulationMismatch } from '../index'

class Foo {
  constructor(public x) { }
  getValue() {
    return this.x
  }
}

test('simple class verify', async () => {
  const fooSpec = await spec(Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class save', async () => {
  const fooSpec = await spec.save('class/simple', Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})

test('simple class simulate', async () => {
  const fooSpec = await spec.simulate('class/simple', Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await fooSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getValue' } },
    { type: 'class/return', payload: 1 }
  ])
})


test('simple class simulate with different constructor will throw', async () => {
  const fooSpec = await spec.simulate('class/wrongConstructorCall', Foo)
  await a.throws(() => new fooSpec.subject(2), SimulationMismatch)
})

class Boo extends Foo {
  getPlusOne() {
    return this.getValue() + 1
  }
}

test('extended class verify', async () => {
  const booSpec = await spec(Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class save', async () => {
  const booSpec = await spec.save('class/extend', Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('extended class replay', async () => {
  const booSpec = await spec.simulate('class/extend', Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not existing spec will spy instead (check log)', async () => {
  const booSpec = await spec.simulate('class/notExist', Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class/constructor', payload: [1] },
    { type: 'class/invoke', payload: [], meta: { name: 'getPlusOne' } },
    { type: 'class/return', payload: 2 }
  ])
})

test('replay on not matching spec will spy instead (check log)', async () => {
  const booSpec = await spec.simulate('class/extendToSpy', Boo)
  const boo = new booSpec.subject(2)
  const actual = boo.getPlusOne()

  t.equal(actual, 3)
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

test('captures callbacks verify', async () => {
  const cbSpec = await spec(WithCallback)
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.equal(v, 'called')
    })
    cb.callback(v => {
      t.equal(v, 'called')
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
        methodId: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        methodId: 1,
        callSite: 0
      }
    }
  ])
})

test('captures callbacks save', async () => {
  const cbSpec = await spec.save('class/withCallback', WithCallback)
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.equal(v, 'called')
    })
    cb.callback(v => {
      t.equal(v, 'called')
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
        methodId: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        methodId: 1,
        callSite: 0
      }
    }
  ])
})

test('captures callbacks replay', async () => {
  const cbSpec = await spec.simulate('class/withCallback', WithCallback)
  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      t.equal(v, 'called')
    })
    cb.callback(v => {
      t.equal(v, 'called')
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
        methodId: 0,
        callSite: 0
      }
    },
    {
      type: 'class/callback',
      payload: ['called'],
      meta: {
        name: 'callback',
        methodId: 1,
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

test('method returning promise should have result of promise saved in payload', async () => {
  const promiseSpec = await spec('class/withPromise', WithPromise)
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.equal(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise/resolve', payload: 4 }
  ])
})

test('method returning promise should have result of promise saved in payload (save)', async () => {
  const promiseSpec = await spec.save('class/withPromise', WithPromise)
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.equal(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise/resolve', payload: 4 }
  ])
})

test('method returning promise should have result of promise saved in payload (replay)', async () => {
  const promiseSpec = await spec.simulate('class/withPromise', WithPromise)
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.equal(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class/constructor', payload: [] },
    { type: 'class/invoke', payload: [3], meta: { name: 'increment' } },
    { type: 'class/return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise/resolve', payload: 4 }
  ])
})
