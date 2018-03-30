import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'
import { setImmediate } from 'timers'

import { spec, SpecNotFound } from '../index'

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
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getValue' } },
    { type: 'class', name: 'return', payload: 1, meta: { methodName: 'getValue' } }
  ])
})

test('simple class save', async () => {
  const fooSpec = await spec.save('class/simple', Foo)
  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await fooSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getValue' } },
    { type: 'class', name: 'return', payload: 1, meta: { methodName: 'getValue' } }
  ])
})

test('simple class simulate', async () => {
  const fooSpec = await spec.simulate('class/simple', Foo)

  const foo = new fooSpec.subject(1)
  const actual = foo.getValue()
  t.equal(actual, 1)

  await fooSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getValue' } },
    { type: 'class', name: 'return', payload: 1, meta: { methodName: 'getValue' } }
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
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getPlusOne' } },
    { type: 'class', name: 'return', payload: 2, meta: { methodName: 'getPlusOne' } }
  ])
})

test('extended class save', async () => {
  const booSpec = await spec.save('class/extend', Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getPlusOne' } },
    { type: 'class', name: 'return', payload: 2, meta: { methodName: 'getPlusOne' } }
  ])
})

test('extended class replay', async () => {
  const booSpec = await spec.simulate('class/extend', Boo)
  const boo = new booSpec.subject(1)
  const actual = boo.getPlusOne()

  t.equal(actual, 2)
  await booSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [1] },
    { type: 'class', name: 'invoke', payload: [], meta: { methodName: 'getPlusOne' } },
    { type: 'class', name: 'return', payload: 2, meta: { methodName: 'getPlusOne' } }
  ])
})

test('simulate on not existing spec will throw', async () => {
  return a.throws(spec.simulate('class/notExist', Boo), SpecNotFound)
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
    {
      type: 'class',
      name: 'constructor',
      payload: [],
      meta: { instanceId: 1 }
    },
    {
      type: 'class',
      name: 'invoke',
      payload: [1],
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'return',
      payload: 1,
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 1,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 2,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 1, invokeId: 1 }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 2,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 3,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 2, invokeId: 1 }
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
    {
      type: 'class',
      name: 'constructor',
      payload: [],
      meta: { instanceId: 1 }
    },
    {
      type: 'class',
      name: 'invoke',
      payload: [1],
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'return',
      payload: 1,
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 1,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 2,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 1, invokeId: 1 }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 2,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 3,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 2, invokeId: 1 }
    }
  ])
})

test('captures callbacks simulate', async () => {
  const cbSpec = await spec.simulate('class/withCallback', WithCallback)

  const cb = new cbSpec.subject()
  cb.justDo(1)
  await new Promise(a => {
    cb.callback(v => {
      console.log('cb.callback called', v)
      t.equal(v, 'called')
    })
    cb.callback(v => {
      console.log('cb.callback2 called', v)
      t.equal(v, 'called')
      a()
    })
  })

  await cbSpec.satisfy([
    {
      type: 'class',
      name: 'constructor',
      payload: [],
      meta: { instanceId: 1 }
    },
    {
      type: 'class',
      name: 'invoke',
      payload: [1],
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'return',
      payload: 1,
      meta: { instanceId: 1, invokeId: 1, methodName: 'justDo' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 2, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'invoke',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'class',
      name: 'return',
      meta: { instanceId: 1, invokeId: 3, methodName: 'callback' }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 1,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 2,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 1, invokeId: 1 }
    },
    {
      type: 'function',
      name: 'invoke',
      payload: ['called'],
      meta: {
        instanceId: 2,
        invokeId: 1,
        sourceType: 'class',
        sourceInstanceId: 1,
        sourceInvokeId: 3,
        sourcePath: [0]
      }
    },
    {
      type: 'function',
      name: 'return',
      meta: { instanceId: 2, invokeId: 1 }
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
    { type: 'class', name: 'constructor', payload: [] },
    { type: 'class', name: 'invoke', payload: [3], meta: { methodName: 'increment' } },
    { type: 'class', name: 'return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', name: 'resolve', payload: 4 }
  ])
})

test('method returning promise should have result of promise saved in payload (save)', async () => {
  const promiseSpec = await spec.save('class/withPromise', WithPromise)
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.equal(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [] },
    { type: 'class', name: 'invoke', payload: [3], meta: { methodName: 'increment' } },
    { type: 'class', name: 'return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', name: 'resolve', payload: 4 }
  ])
})

test('method returning promise should have result of promise saved in payload (replay)', async () => {
  const promiseSpec = await spec.simulate('class/withPromise', WithPromise)
  console.log(promiseSpec.actions)
  const p = new promiseSpec.subject()
  const actual = await p.increment(3)

  t.equal(actual, 4)

  await promiseSpec.satisfy([
    { type: 'class', name: 'constructor', payload: [] },
    { type: 'class', name: 'invoke', payload: [3], meta: { methodName: 'increment' } },
    { type: 'class', name: 'return', payload: {}, meta: { returnType: 'promise' } },
    { type: 'promise', name: 'resolve', payload: 4 }
  ])
})
