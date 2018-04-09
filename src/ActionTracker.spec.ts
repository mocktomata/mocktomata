import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'

import { SpecNotFound } from '.'
import { ActionTracker } from './ActionTracker'
import { io } from './io'
import { createSpecAction } from './testUtil'

test('Wrong action throws mismatch', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/success')

  await a.throws(() => tracker.nextAction({
    type: 'function',
    name: 'invoke',
    // should be [2, ...]
    payload: [1, () => ({})],
    instanceId: 1,
    invokeId: 1
  }), SimulationMismatch)
})

test('will invoke callback in arguments', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/success')
  console.info(tracker.actions)
  const o = new AssertOrder(1)
  tracker.nextAction({
    type: 'function',
    name: 'invoke',
    payload: [2, () => o.once(1)],
    instanceId: 1,
    invokeId: 1
  })
  o.end()
})

test('will invoke callback in arguments with error', async () => {
  const tracker = await setupTrackerTest('function/simpleCallback/fail')
  const o = new AssertOrder(1)
  tracker.nextAction({
    type: 'function',
    name: 'invoke',
    payload: [2, err => {
      o.once(1)
      t.equal(err.message, 'fail')
    }],
    instanceId: 1,
    invokeId: 1
  })
  o.end()
})

test('invoke callback in literal inside arguments', async () => {
  const tracker = await setupTrackerTest('function/literalCallback/success')
  const o = new AssertOrder(1)
  tracker.nextAction({
    type: 'function',
    name: 'invoke',
    payload: [{
      data: 2, success(value) {
        o.once(1)
        t.equal(value, 3)
      }
    }],
    instanceId: 1,
    invokeId: 1
  })
  o.end()
})

test('invoke callback post return', async () => {
  const tracker = await setupTrackerTest('function/postReturn/success')
  const o = new AssertOrder(3)
  await new Promise(a => {
    tracker.nextAction({
      type: 'function',
      name: 'invoke',
      payload: ['event', 3, () => {
        if (o.any([1, 2, 3]) === 3)
          a()
      }],
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

  const err = await a.throws(() => tracker.nextAction(invoke), SimulationMismatch)
  t.deepEqual(err.expected, { type: 'function', name: 'return', instanceId: 1, invokeId: 1 })
  t.deepEqual(err.actual, undefined)
})

test('Missing ')

test.skip('resolving promise', async () => {
  const tracker = await setupTrackerTest('promise/resolve')
  const o = new AssertOrder(3)
  console.info(tracker.actions)
  await new Promise(a => {
    tracker.nextAction({
      type: 'function',
      name: 'invoke',
      payload: ['increment', 2],
      instanceId: 1,
      invokeId: 1
    })
    t(tracker.succeed())
    tracker.result().then(() => a())
  })
  o.end()
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
