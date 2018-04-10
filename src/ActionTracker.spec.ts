import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'

import { SpecNotFound, functionConstructed, functionInvoked } from '.'
import { ActionTracker, createStubContext } from './ActionTracker'
import { io } from './io'
import { createSpecAction } from './testUtil'

test('Wrong action throws mismatch', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/success')

  tracker.received({ ...functionConstructed({ functionName: 'success' }), instanceId: 1 })
  await a.throws(() => tracker.received(
    // should be [2, ...]
    { ...functionInvoked(1, () => ({})), instanceId: 1, invokeId: 1 }),
    SimulationMismatch)
})

test('will invoke callback in arguments', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/success')
  const o = new AssertOrder(1)
  tracker.received({ ...functionConstructed({ functionName: 'success' }), instanceId: 1 })
  tracker.received({ ...functionInvoked(2, () => o.once(1)), instanceId: 1, invokeId: 1 })
  o.end()
})

test('will invoke callback in arguments with error', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/fail')
  const o = new AssertOrder(1)
  tracker.received({ ...functionConstructed({ functionName: 'fail' }), instanceId: 1 })
  tracker.received({
    ...functionInvoked(2, err => {
      o.once(1)
      t.equal(err.message, 'fail')
    }),
    instanceId: 1,
    invokeId: 1
  })
  o.end()
})

test('invoke callback in literal inside arguments', async () => {
  const tracker = await setupTrackerTest('function/literalCallback/success')
  const o = new AssertOrder(1)
  tracker.received({ ...functionConstructed({ functionName: 'success' }), instanceId: 1 })
  tracker.received({
    ...functionInvoked({
      data: 2, success(value) {
        o.once(1)
        t.equal(value, 3)
      }
    }),
    instanceId: 1,
    invokeId: 1
  })
  o.end()
})

test('invoke callback post return', async () => {
  const tracker = await setupTrackerTest('function/postReturn/success')
  const o = new AssertOrder(3)
  await new Promise(a => {
    tracker.received({ ...functionConstructed({ functionName: 'fireEvent' }), instanceId: 1 })
    tracker.received({
      ...functionInvoked('event', 3, () => {
        if (o.any([1, 2, 3]) === 3)
          a()
      }),
      instanceId: 1,
      invokeId: 1
    })
    t(tracker.succeed())
    tracker.result()
  })
  o.end()
})

test('Missing return action throws SimulationMismatch', async () => {
  const invoke = createSpecAction({ type: 'function', name: 'invoke', instanceId: 1, invokeId: 1 })

  const tracker = new ActionTracker('no return action', [
    invoke
  ])

  const err = await a.throws(() => tracker.received(invoke), SimulationMismatch)
  t.deepEqual(err.expected, { type: 'function', name: 'return', instanceId: 1, invokeId: 1 })
  t.deepEqual(err.actual, undefined)
})

test('resolving promise', async () => {
  const tracker = await setupTrackerTest('promise/resolve')
  const actual = await new Promise(a => {
    tracker.received({ ...functionConstructed({ functionName: 'success' }), instanceId: 1 })
    tracker.received({ ...functionInvoked('increment', 2), instanceId: 1, invokeId: 1 })
    t(tracker.succeed())
    tracker.result().then(v => a(v))
  })
  t.equal(actual, 3)
})

test('promise/inBetween', async () => {
  const tracker = await setupTrackerTest('promise/inBetween')
  const o = new AssertOrder(1)
  const actual = await new Promise(a => {
    tracker.received({ ...functionConstructed({ functionName: 'foo' }), instanceId: 1 })
    tracker.received({
      ...functionInvoked(2, v => {
        o.once(1)
        t.equal(v, 'called')
      }), instanceId: 1, invokeId: 1
    })
    t(tracker.succeed())
    tracker.result().then(v => a(v))
  })
  t.equal(actual, 3)
})

test('spec/delayed/multiple', async () => {
  const tracker = await setupTrackerTest('spec/delayed/multiple')
  const o = new AssertOrder(2)
  const context = createStubContext(tracker, 'function')
  const instance = context.newInstance(undefined, { functionName: 'success' })
  const call1 = instance.newCall()
  call1.invoked([2, (_err, v) => {
    o.once(1)
    t.equal(v, 3)
  }])
  call1.result()
  const call2 = instance.newCall()
  call2.invoked([4, (_err, v) => {
    o.once(2)
    t.equal(v, 5)
  }])
  call2.result()
})

async function setupTrackerTest(specId: string) {
  return new ActionTracker(specId, await loadActions(specId))
}

async function loadActions(specId: string) {
  try {
    const specRecord = await io.readSpec(specId)
    return specRecord.actions
  }
  catch (err) {
    throw new SpecNotFound(specId, err)
  }
}
