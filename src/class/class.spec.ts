import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'
import { setImmediate } from 'timers'

import { spec, SpecNotFound } from '..'
import { testTrio } from '../testUtil'


class Foo {
  constructor(public x) { }
  getValue() {
    return this.x
  }
}

class Boo extends Foo {
  getPlusOne() {
    return this.getValue() + 1
  }
}


test('simple class simulate with different constructor will throw', async () => {
  const fooSpec = await spec.simulate('class/wrongConstructorCall', Foo)
  await a.throws(() => new fooSpec.subject(2), SimulationMismatch)
})


test('simulate on not existing spec will throw', async () => {
  return a.throws(spec.simulate('class/notExist', Boo), SpecNotFound)
})

testTrio('class/simple', (title, spec) => {
  test(title, async () => {
    const s = await spec(Foo)
    const foo = new s.subject(1)
    const actual = foo.getValue()
    t.equal(actual, 1)

    await s.satisfy([
      { type: 'class', name: 'constructor', payload: [1], instanceId: 1 },
      { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getValue' }, instanceId: 1, invokeId: 1 },
      { type: 'class', name: 'return', payload: 1, meta: { methodName: 'getValue' }, instanceId: 1, invokeId: 1 }
    ])
  })
})

testTrio('class/extend', (title, spec) => {
  test(title, async () => {
    const s = await spec(Boo)
    const boo = new s.subject(1)
    const actual = boo.getPlusOne()

    t.equal(actual, 2)
    await s.satisfy([
      { type: 'class', name: 'constructor', payload: [1], instanceId: 1 },
      { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getPlusOne' }, instanceId: 1, invokeId: 1 },
      { type: 'class', name: 'return', payload: 2, meta: { methodName: 'getPlusOne' }, instanceId: 1, invokeId: 1 }
    ])
  })
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

testTrio('class/withCallback', (title, spec) => {
  test(title, async () => {
    const s = await spec(WithCallback)
    const cb = new s.subject()

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

    await s.satisfy([
      {
        type: 'class',
        name: 'constructor',
        payload: [],
        instanceId: 1
      },
      {
        type: 'class',
        name: 'invoke',
        payload: [1],
        meta: { methodName: 'justDo' },
        instanceId: 1,
        invokeId: 1
      },
      {
        type: 'class',
        name: 'return',
        payload: 1,
        meta: { methodName: 'justDo' },
        instanceId: 1,
        invokeId: 1
      },
      {
        type: 'class',
        name: 'invoke',
        meta: { methodName: 'callback' },
        instanceId: 1,
        invokeId: 2
      },
      {
        type: 'class',
        name: 'return',
        meta: { methodName: 'callback' },
        instanceId: 1,
        invokeId: 2
      },
      {
        type: 'class',
        name: 'invoke',
        meta: { methodName: 'callback' },
        instanceId: 1,
        invokeId: 3
      },
      {
        type: 'class',
        name: 'return',
        meta: { methodName: 'callback' },
        instanceId: 1,
        invokeId: 3
      },
      {
        type: 'komondor',
        name: 'callback',
        payload: ['called'],
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 2,
        sourcePath: [0]
      },
      {
        type: 'komondor',
        name: 'callback',
        payload: ['called'],
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 3,
        sourcePath: [0]
      }
    ])
  })
})

class WithPromise {
  increment(x) {
    return new Promise(a => {
      setImmediate(() => a(x + 1))
    })
  }
}

testTrio('method returning promise should have result of promise saved in payload',
  'class/withPromise',
  (title, spec) => {
    test(title, async () => {
      const s = await spec(WithPromise)
      const p = new s.subject()
      const actual = await p.increment(3)

      t.equal(actual, 4)
      await s.satisfy([
        { type: 'class', name: 'constructor', payload: [], instanceId: 1 },
        { type: 'class', name: 'invoke', payload: [3], meta: { methodName: 'increment' }, instanceId: 1, invokeId: 1 },
        { type: 'class', name: 'return', payload: {}, instanceId: 1, invokeId: 1, returnType: 'promise', returnInstanceId: 1 }, // TODO: returnInstanceId + returnInvokeId?
        { type: 'promise', name: 'return', payload: 4, meta: { status: 'resolve' }, instanceId: 1, invokeId: 1 }
      ])
    })
  })

class Throwing {
  doThrow() {
    throw new Error('thrown')
  }
}

testTrio('class/throwing', (title, spec) => {
  test(title, async () => {
    const s = await spec(Throwing)
    const o = new s.subject()
    await a.throws(() => o.doThrow())

    await s.satisfy([
      { type: 'class', name: 'constructor', instanceId: 1 },
      {
        type: 'class',
        name: 'invoke',
        meta: { methodName: 'doThrow' },
        instanceId: 1,
        invokeId: 1
      },
      {
        type: 'class',
        name: 'throw',
        payload: { message: 'thrown' },
        meta: { methodName: 'doThrow' },
        instanceId: 1,
        invokeId: 1
      }
    ])
  })
})
