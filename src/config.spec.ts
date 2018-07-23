import a, { AssertOrder } from 'assertron'
import t from 'assert'

import { config, given, onGiven, spec, MissingSpecID, functionConstructed, functionInvoked, functionReturned } from '.'
import { resetStore } from './store'

const simpleCallback = {
  increment(remote, x) {
    return new Promise((a, r) => {
      remote(x, (err, response) => {
        if (err) r(err)
        a(response)
      })
    })
  },
  success(a, callback) {
    callback(null, a + 1)
  },
  fail(_a, callback) {
    callback({ message: 'fail' }, null)
  }
}

const fake = {
  success(_a, _callback) {
    throw new Error('should not reach')
  },
  fail(_a, _callback) {
    throw new Error('should not reach')
  }
}

const forceReplaySuccessExpectation = [
  { ...functionConstructed({ functionName: 'success' }), instanceId: 1 },
  { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
  { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
  { ...functionInvoked(null, 3), instanceId: 2, invokeId: 1 },
  { ...functionReturned(), instanceId: 2, invokeId: 1 },
  { ...functionReturned(), instanceId: 1, invokeId: 1 }]


const forceReplayFailExpectation = [
  { ...functionConstructed({ functionName: 'fail' }), instanceId: 1 },
  { ...functionInvoked(2), instanceId: 1, invokeId: 1 },
  { ...functionConstructed(), instanceId: 2, sourceType: 'function', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
  { ...functionInvoked({ message: 'fail' }), instanceId: 2, invokeId: 1 },
  { ...functionReturned(), instanceId: 2, invokeId: 1 },
  { ...functionReturned(), instanceId: 1, invokeId: 1 }]

beforeEach(() => {
  resetStore()
})

afterEach(() => {
  resetStore()
})

test(`config.spec('simulate') will force all specs in simulate mode`, async () => {
  // const s = await spec.save('config/forceReplaySuccess', simpleCallback.success)
  // const actual = await simpleCallback.increment(s.subject, 2)
  // await s.satisfy(forceReplaySuccessExpectation)

  // t.strictEqual(actual, 3)

  config.spec('simulate')

  const s = await spec('config/forceReplaySuccess', fake.success)
  const actual = await simpleCallback.increment(s.subject, 2)

  await s.satisfy(forceReplaySuccessExpectation)

  t.strictEqual(actual, 3)
})

test('config.spec() can filter for specific spec', async () => {
  // const successSpec = await spec.save('config/forceReplayFail', simpleCallback.fail)
  // await simpleCallback.increment(successSpec.subject, 2)
  //   .then(() => t.fail('should not reach'))
  //   .catch(() => {
  //     // this should fail if the spec is in 'verify' mode.
  //     // The save record is failing.
  //     return successSpec.satisfy(forceReplayFailExpectation)
  //   })

  config.spec('simulate', 'config/forceReplayFail')

  const successSpec = await spec('config/forceReplayFail', fake.fail)
  await simpleCallback.increment(successSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      // this should fail if the spec is in 'verify' mode.
      // The save record is failing.
      return successSpec.satisfy(forceReplayFailExpectation)
    })
  config.spec('simulate', 'not exist - no effect')

  const failSpec = await spec('config/forceReplaySuccess', simpleCallback.fail)
  await simpleCallback.increment(failSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      // this should fail if the spec is in 'replay' mode.
      // The saved record is succeeding.
      return failSpec.satisfy(forceReplayFailExpectation)
    })
})

test('config.spec() can filter using regex', async () => {
  config.spec('simulate', /config\/forceReplay/)
  const successSpec = await spec('config/forceReplayFail', fake.fail)
  await simpleCallback.increment(successSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return successSpec.satisfy(forceReplayFailExpectation)
    })
})

test(`config.spec() can use 'live' mode to switch spec in simulation to make live call`, async () => {
  config.spec('live')
  const sucessSpec = await spec.simulate('config/forceReplayFail', simpleCallback.success)
  const actual = await simpleCallback.increment(sucessSpec.subject, 2)
  t.strictEqual(actual, 3)

  await sucessSpec.satisfy(forceReplaySuccessExpectation)
})

test(`config.spec('save'|'simulate') will cause spec with no id to throw`, async () => {
  config.spec('save')
  const err: MissingSpecID = await a.throws(spec(simpleCallback.success), MissingSpecID)
  t.strictEqual(err.mode, 'save')

  config.spec('simulate')
  const err2: MissingSpecID = await a.throws(spec(simpleCallback.success), MissingSpecID)
  t.strictEqual(err2.mode, 'simulate')
})


test('config.given() with no filter sets mode for all environments', async () => {
  config.given('live')
  onGiven('config all 1', ({ mode }) => {
    t.strictEqual(mode, 'live')
  })
  onGiven('config all 2', ({ mode }) => {
    t.strictEqual(mode, 'live')
  })
  return Promise.all([
    given.simulate('config all 1'),
    given.simulate('config all 2')
  ])
})

test('config.given() can filter by string', async () => {
  config.given('live', 'config specific yes')
  onGiven('config specific yes', ({ mode }) => {
    t.strictEqual(mode, 'live')
  })
  onGiven('config specific no', ({ mode }) => {
    t.strictEqual(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config specific yes'),
    given.simulate('config specific no')
  ])
})

test('config.given() can filter by regex', async () => {
  config.given('live', /yes/)
  onGiven('config regex yes', ({ mode }) => {
    t.strictEqual(mode, 'live')
  })
  onGiven('config regex no', ({ mode }) => {
    t.strictEqual(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config regex yes'),
    given.simulate('config regex no')
  ])
})

test(`config.given('live') will force spec.sim() to spec()`, async () => {
  config.given('live', 'force spec.simulate to live')
  const order = new AssertOrder(1)
  await given.simulate('force spec.simulate to live', async ({ spec }) => {
    function success(a, callback) {
      order.once(1)
      callback(null, a + 1)
    }

    const simpleSpec = await spec.simulate('simpleCallback', success)
    const actual = await simpleCallback.increment(simpleSpec.subject, 2)
    t.strictEqual(actual, 3)
  })
  order.end()
})

test(`config.given('save') to force live to save`, async () => {
  config.given('save', 'live to save')

  await given('live to save', async ({ spec }) => t.strictEqual(spec.name, 'specSave'))
})

test(`config.given('save') to force simulate to save`, async () => {
  config.given('save', 'simulate to save')

  await given.simulate('simulate to save', async ({ spec }) => t.strictEqual(spec.name, 'specSave'))
})

test('register plugin manually', () => {
  const o = new AssertOrder(1)
  const fakePlugin = {
    activate() {
      o.once(1)
    }
  }
  config.registerPlugin(fakePlugin)

  o.end()
})
