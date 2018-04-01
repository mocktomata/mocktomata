import t from 'assert'
import a, { satisfy, AssertOrder } from 'assertron'

import { spec, SpecNotFound, functionInvoked, functionReturned, functionThrown } from '..'
import {
  simpleCallback,
  fetch,
  literalCallback,
  synchronous,
  delayed,
  recursive,
  postReturn
} from './testSuites'
import { testTrio } from '../testUtil'

function increment(x) {
  return x + 1
}
function doThrow() {
  throw new Error('throwing')
}

test('acceptance', async () => {
  const inc = await spec(increment)
  inc.subject(1)

  await inc.satisfy([
    functionInvoked(1),
    functionReturned(2)
  ])

  const s = await spec(doThrow)
  await a.throws(() => s.subject())

  await s.satisfy([
    functionInvoked(),
    functionThrown({ message: 'throwing' })
  ])
})

test('get same object if nothing to spy on', async () => {
  t.deepEqual(await testObject({}), {})
  t.deepEqual(await testObject({ a: 1 }), { a: 1 })
  t.deepEqual(await testObject({ a: true }), { a: true })
  t.deepEqual(await testObject({ a: 'a' }), { a: 'a' })
})

async function testObject(expected) {
  const objSpec = await spec(() => expected)
  const actual = objSpec.subject()
  t.deepEqual(actual, expected)
  return actual
}

test('simulate with not existing record will throw', async () => {
  return a.throws(spec.simulate('function/simpleCallback/notExist', simpleCallback.success), SpecNotFound)
})

testTrio('onAny(callback) will invoke on any action', 'function/simpleCallback/success', (title, spec) => {
  test(title, async () => {
    const o = new AssertOrder(3)
    const s = await spec(simpleCallback.success)

    s.onAny(action => {
      o.any([1, 2, 3])
      t(action)
    })

    await simpleCallback.increment(s.subject, 2)
    o.end()
  })
})

testTrio('function/simpleCallback/success', (title, spec) => {
  test(title, async () => {
    const o = new AssertOrder(3)
    const s = await spec(simpleCallback.success)

    s.on('function', 'invoke', action => {
      o.once(1)
      satisfy(action, { type: 'function', name: 'invoke', payload: [2], instanceId: 1, invokeId: 1 })
    })

    s.on('komondor', 'callback', action => {
      o.once(2)
      satisfy(action, {
        type: 'komondor',
        name: 'callback',
        payload: [null, 3],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [1]
      })
    })

    s.on('function', 'return', action => {
      o.once(3)
      satisfy(action, { type: 'function', name: 'return', instanceId: 1, invokeId: 1 })
    })

    await simpleCallback.increment(s.subject, 2)

    await s.satisfy([
      { type: 'function', name: 'invoke', payload: [2], instanceId: 1, invokeId: 1 },
      {
        type: 'komondor',
        name: 'callback',
        payload: [null, 3],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [1]
      },
      { type: 'function', name: 'return', instanceId: 1, invokeId: 1 }
    ])
    o.end()
  })
})

testTrio('function/simpleCallback/fail', (title, spec) => {
  test(title, async () => {
    const o = new AssertOrder(3)
    const s = await spec(simpleCallback.fail)

    s.on('function', 'invoke', action => {
      o.once(1)
      satisfy(action, { type: 'function', name: 'invoke', payload: [2], instanceId: 1, invokeId: 1 })
    })

    s.on('komondor', 'callback', action => {
      o.once(2)
      satisfy(action, {
        type: 'komondor',
        name: 'callback',
        payload: [{ message: 'fail' }],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [1]
      })
    })

    s.on('function', 'return', action => {
      o.once(3)
      satisfy(action, { type: 'function', name: 'return', instanceId: 1, invokeId: 1 })
    })

    return simpleCallback.increment(s.subject, 2)
      .then(() => t.fail('should not reach'))
      .catch(async () => {
        await s.satisfy([{
          type: 'function', name: 'invoke',
          payload: [2],
          instanceId: 1,
          invokeId: 1
        },
        {
          type: 'komondor', name: 'callback',
          payload: [{ message: 'fail' }, null],
          sourceType: 'function',
          sourceInstanceId: 1,
          sourceInvokeId: 1,
          sourcePath: [1]
        },
        { type: 'function', name: 'return', instanceId: 1 }])
        o.end()
      })
  })
})

testTrio('function spec can be called multiple times', 'spec/delayed/multiple', (title, spec) => {
  test(title, async () => {
    const s = await spec(delayed.success)
    await delayed.increment(s.subject, 2)
    await delayed.increment(s.subject, 4)

    await s.satisfy([{
      type: 'function',
      name: 'invoke',
      payload: [2],
      instanceId: 1, invokeId: 1
    },
    {
      type: 'function',
      name: 'return',
      instanceId: 1, invokeId: 1
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: [null, 3],
      sourceType: 'function',
      sourceInstanceId: 1,
      sourceInvokeId: 1,
      sourcePath: [1]
    },
    {
      type: 'function',
      name: 'invoke',
      payload: [4],
      instanceId: 1,
      invokeId: 2
    },
    {
      type: 'function',
      name: 'return',
      instanceId: 1,
      invokeId: 2
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: [null, 5],
      sourceType: 'function',
      sourceInstanceId: 1,
      sourceInvokeId: 2,
      sourcePath: [1]
    }])
  })
})

testTrio('function/fetch/success', (title, spec) => {
  test(title, async () => {
    const s = await spec(fetch.success)

    const actual = await fetch.add(s.subject, 1, 2)

    await s.satisfy([
      {
        type: 'function',
        name: 'invoke',
        payload: ['remoteAdd', { x: 1, y: 2 }],
        instanceId: 1, invokeId: 1
      },
      {
        type: 'komondor', name: 'callback',
        payload: [null, 3],
        sourceType: 'function',
        sourceInstanceId: 1,
        sourceInvokeId: 1,
        sourcePath: [2]
      },
      { type: 'function', name: 'return', instanceId: 1, invokeId: 1 }
    ])
    t.equal(actual, 3)
  })
})

testTrio('function/fetch/fail', (title, spec) => {
  test(title, async () => {
    const s = await spec(fetch.fail)
    return fetch.add(s.subject, 1, 2)
      .then(() => t.fail('should not reach'))
      .catch(() => {
        return s.satisfy([
          {
            type: 'function',
            name: 'invoke',
            payload: ['remoteAdd', { x: 1, y: 2 }],
            instanceId: 1, invokeId: 1
          },
          {
            type: 'komondor',
            name: 'callback',
            payload: [{ message: 'fail' }, null],
            sourceType: 'function',
            sourceInstanceId: 1,
            sourceInvokeId: 1,
            sourcePath: [2]
          },
          { type: 'function', name: 'return', instanceId: 1, invokeId: 1 }
        ])
      })
  })
})

testTrio('function/literalCallback/success', (title, spec) => {
  test(title, async () => {
    const s = await spec(literalCallback.success)
    const actual = await literalCallback.increment(s.subject, 2)

    t.equal(actual, 3)
    await s.satisfy([
      { type: 'function', name: 'invoke', payload: [{ 'data': 2 }], instanceId: 1, invokeId: 1 },
      {
        type: 'komondor', name: 'callback',
        payload: [3],
        sourceType: 'function',
        sourceInstanceId: 1,
        sourceInvokeId: 1,
        sourcePath: [0, 'success']
      },
      { type: 'function', name: 'return', instanceId: 1, invokeId: 1 }
    ])
  })
})

testTrio('function/literalCallback/fail', (title, spec) => {
  test(title, async () => {
    const s = await spec(literalCallback.fail)
    await literalCallback.increment(s.subject, 2)
      .then(() => t.fail('should not reach'))
      .catch(() => {
        return s.satisfy([
          { type: 'function', name: 'invoke', payload: [{ 'data': 2 }], instanceId: 1, invokeId: 1 },
          {
            type: 'komondor', name: 'callback',
            payload: [undefined, undefined, { message: 'fail' }],
            sourceType: 'function',
            sourceInstanceId: 1,
            sourceInvokeId: 1,
            sourcePath: [0, 'error']
          },
          { type: 'function', name: 'return', instanceId: 1, invokeId: 1 }
        ])
      })
  })
})

testTrio('function/synchronous/success', (title, spec) => {
  test(title, async () => {
    const speced = await spec(synchronous.success)
    const actual = synchronous.increment(speced.subject, 2)

    t.equal(actual, 3)
    await speced.satisfy([
      { type: 'function', name: 'invoke', payload: ['increment', 2], instanceId: 1, invokeId: 1 },
      { type: 'function', name: 'return', payload: 3, instanceId: 1, invokeId: 1 }
    ])
  })
})

testTrio('function/synchronous/fail', (title, spec) => {
  test(title, async () => {
    const s = await spec(synchronous.fail)

    a.throws(() => synchronous.increment(s.subject, 2), e => e.message === 'fail')

    await s.satisfy([
      { type: 'function', name: 'invoke', payload: ['increment', 2], instanceId: 1, invokeId: 1 },
      { type: 'function', name: 'throw', payload: { message: 'fail' }, instanceId: 1, invokeId: 1 }
    ])
  })
})

testTrio('function/recursive/twoCalls', (title, spec) => {
  test(title, async () => {
    const cbSpec = await spec(recursive.success)
    const actual = await recursive.decrementToZero(cbSpec.subject, 2)
    t.equal(actual, 0)

    await cbSpec.satisfy([{
      type: 'function',
      name: 'invoke',
      payload: [2],
      instanceId: 1, invokeId: 1
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: [null, 1],
      sourceType: 'function',
      sourceInstanceId: 1,
      sourceInvokeId: 1,
      sourcePath: [1]
    },
    {
      type: 'function',
      name: 'invoke',
      payload: [1],
      instanceId: 1,
      invokeId: 2
    },
    {
      type: 'komondor',
      name: 'callback',
      payload: [null, 0],
      sourceType: 'function',
      sourceInstanceId: 1,
      sourceInvokeId: 2,
      sourcePath: [1]
    },
    {
      type: 'function',
      name: 'return',
      payload: undefined,
      instanceId: 1,
      invokeId: 2
    },
    {
      type: 'function',
      name: 'return',
      payload: undefined,
      instanceId: 1, invokeId: 1
    }])
  })
})

testTrio('function/postReturn/success', (title, spec) => {
  test(title, async () => {
    const s = await spec(postReturn.fireEvent)
    // console.log(s.actions)
    await new Promise(a => {
      let called = 0
      s.subject('event', 3, () => {
        called++
        // console.log('received event', called)
        if (called === 3)
          a()
      })
    })

    await s.satisfy([
      { type: 'function', name: 'invoke', payload: ['event', 3], instanceId: 1, invokeId: 1 },
      { type: 'function', name: 'return', instanceId: 1, invokeId: 1 },
      {
        type: 'komondor',
        name: 'callback',
        payload: ['event'],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [2]
      },
      {
        type: 'komondor',
        name: 'callback',
        payload: ['event'],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [2]
      },
      {
        type: 'komondor',
        name: 'callback',
        payload: ['event'],
        sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourcePath: [2]
      }
    ])
  })
})
