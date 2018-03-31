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

testTrio('class/simple', async spec => {
  const s = await spec(Foo)
  const foo = new s.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await s.satisfy([
    { type: 'class', name: 'constructor', payload: [1], instanceId: 1, meta: {} },
    { type: 'class', name: 'invoke', payload: [], instanceId: 1, meta: { invokeId: 1, methodName: 'getValue' } },
    { type: 'class', name: 'return', payload: 1, instanceId: 1, meta: { invokeId: 1, methodName: 'getValue' } }
  ])
})

testTrio('class/extend', async spec => {
  const s = await spec(Boo)
  const boo = new s.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await s.satisfy([
    { type: 'class', name: 'constructor', payload: [1], instanceId: 1, meta: {} },
    { type: 'class', name: 'invoke', payload: [], instanceId: 1, meta: { invokeId: 1, methodName: 'getPlusOne' } },
    { type: 'class', name: 'return', payload: 2, instanceId: 1, meta: { invokeId: 1, methodName: 'getPlusOne' } }
  ])
})

class WithCallback {
  callback(cb) {
    console.log('callback invoked with', cb)
    setImmediate(() => {
      cb('called')
    })
  }
  justDo(x) {
    console.log('justDo invoked with', x)
    return x
  }
}

testTrio('class/withCallback', async spec => {
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
      instanceId: 1,
      meta: {}
    },
    {
      type: 'class',
      name: 'invoke',
      payload: [1],
      instanceId: 1,
      meta: {
        invokeId: 1, methodName: 'justDo'
      }
    },
    {
      type: 'class',
      name: 'return',
      payload: 1,
      instanceId: 1, meta: { invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'invoke',
      instanceId: 1, meta: { invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      instanceId: 1, meta: { invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'invoke',
      instanceId: 1, meta: { invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      instanceId: 1, meta: { invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: ['called'],
      meta: {
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 2,
        sourcePath: [0]
      }
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: ['called'],
      meta: {
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 3,
        sourcePath: [0]
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

testTrio('method returning promise should have result of promise saved in payload',
  'class/withPromise',
  async spec => {
    const s = await spec(WithPromise)
    const p = new s.subject()
    const actual = await p.increment(3)

    t.equal(actual, 4)
    await s.satisfy([
      { type: 'class', name: 'constructor', payload: [], instanceId: 1, meta: {} },
      { type: 'class', name: 'invoke', payload: [3], instanceId: 1, meta: { invokeId: 1, methodName: 'increment' } },
      { type: 'class', name: 'return', payload: {}, instanceId: 1, meta: { invokeId: 1, returnType: 'promise', returnInstanceId: 1 } }, // TODO: returnInstanceId + returnInvokeId?
      { type: 'promise', name: 'resolve', payload: 4, instanceId: 1, meta: { invokeId: 1 } }
    ])
  })
