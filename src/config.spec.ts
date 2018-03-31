import a, { AssertOrder } from 'assertron'
import t from 'assert'

import { config, given, onGiven, spec, MissingSpecID } from './index'
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

beforeEach(() => {
  resetStore()
})

afterEach(() => {
  resetStore()
})

test(`config.spec('simulate') will force all specs in simulate mode`, async () => {
  config.spec('simulate')

  // const s = await spec.save('config/forceReplaySuccess', simpleCallback.success)
  const s = await spec('config/forceReplaySuccess', simpleCallback.fail)
  const actual = await simpleCallback.increment(s.subject, 2)

  console.log(s.actions)
  // this should have failed if the spec is running in 'live' mode.
  // The actual call is failing.
  await s.satisfy([
    { 'type': 'function', 'name': 'invoke', 'payload': [2], 'meta': { 'instanceId': 1, 'invokeId': 1 } },
    {
      'type': 'komondor',
      'name': 'callback',
      'payload': [null, 3],
      'meta': {
        'sourceType': 'function',
        'sourceInstanceId': 1,
        'sourceInvokeId': 1,
        'sourcePath': [1]
      }
    },
    { 'type': 'function', 'name': 'return', 'meta': { 'instanceId': 1, 'invokeId': 1 } }
  ])

  t.equal(actual, 3)
})

test('config.spec() can filter for specific spec', async () => {
  config.spec('simulate', 'not exist - no effect')

  const failSpec = await spec('config/forceReplaySuccess', simpleCallback.fail)
  await simpleCallback.increment(failSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      // this should fail if the spec is in 'replay' mode.
      // The saved record is succeeding.
      return failSpec.satisfy([
        {
          'type': 'function',
          'name': 'invoke',
          'payload': [2],
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        },
        {
          'type': 'komondor',
          'name': 'callback',
          'payload': [{ 'message': 'fail' }],
          'meta': {
            'sourceType': 'function',
            'sourceInstanceId': 1,
            'sourceInvokeId': 1,
            'sourcePath': [1]
          }
        },
        {
          'type': 'function',
          'name': 'return',
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        }
      ])
    })

  config.spec('simulate', 'config/forceReplayFail')

  // const successSpec = await spec.save('config/forceReplayFail', simpleCallback.fail)
  const successSpec = await spec('config/forceReplayFail', simpleCallback.success)
  await simpleCallback.increment(successSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      // this should fail if the spec is in 'verify' mode.
      // The save record is failing.
      return successSpec.satisfy([
        {
          'type': 'function',
          'name': 'invoke',
          'payload': [2],
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        },
        {
          'type': 'komondor',
          'name': 'callback',
          'payload': [{ 'message': 'fail' }],
          'meta': {
            'sourceType': 'function',
            'sourceInstanceId': 1,
            'sourceInvokeId': 1,
            'sourcePath': [1]
          }
        },
        {
          'type': 'function',
          'name': 'return',
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        }
      ])
    })
})

test('config.spec() can filter using regex', async () => {
  config.spec('simulate', /config\/forceReplay/)
  const sucessSpec = await spec('config/forceReplayFail', simpleCallback.success)
  await simpleCallback.increment(sucessSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return sucessSpec.satisfy([
        {
          'type': 'function',
          'name': 'invoke',
          'payload': [2],
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        },
        {
          'type': 'komondor',
          'name': 'callback',
          'payload': [{ 'message': 'fail' }
          ],
          'meta': {
            'sourceType': 'function',
            'sourceInstanceId': 1,
            'sourceInvokeId': 1,
            'sourcePath': [1]
          }
        },
        {
          'type': 'function',
          'name': 'return',
          'meta': { 'instanceId': 1, 'invokeId': 1 }
        }
      ])
    })
})

test(`config.spec() can use 'live' mode to switch spec in simulation to make live call`, async () => {
  config.spec('live')
  const sucessSpec = await spec.simulate('config/forceReplayFail', simpleCallback.success)
  const actual = await simpleCallback.increment(sucessSpec.subject, 2)
  t.equal(actual, 3)

  await sucessSpec.satisfy([
    {
      'type': 'function',
      'name': 'invoke',
      'payload': [2],
      'meta': { 'instanceId': 1, 'invokeId': 1 }
    },
    {
      'type': 'komondor',
      'name': 'callback',
      'payload': [null, 3],
      'meta': {
        'sourceType': 'function',
        'sourceInstanceId': 1,
        'sourceInvokeId': 1,
        'sourcePath': [1]
      }
    },
    {
      'type': 'function',
      'name': 'return',
      'meta': { 'instanceId': 1, 'invokeId': 1 }
    }
  ])
})

test(`config.spec('save'|'simulate') will cause spec with no id to throw`, async () => {
  config.spec('save')
  const err: MissingSpecID = await a.throws(spec(simpleCallback.success), MissingSpecID)
  t.equal(err.mode, 'save')

  config.spec('simulate')
  const err2: MissingSpecID = await a.throws(spec(simpleCallback.success), MissingSpecID)
  t.equal(err2.mode, 'simulate')
})


test('config.environment() with no filter sets mode for all environments', async () => {
  config.environment('live')
  onGiven('config all 1', ({ mode }) => {
    t.equal(mode, 'live')
  })
  onGiven('config all 2', ({ mode }) => {
    t.equal(mode, 'live')
  })
  return Promise.all([
    given.simulate('config all 1'),
    given.simulate('config all 2')
  ])
})

test('config.environment() can filter by string', async () => {
  config.environment('live', 'config specific yes')
  onGiven('config specific yes', ({ mode }) => {
    t.equal(mode, 'live')
  })
  onGiven('config specific no', ({ mode }) => {
    t.equal(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config specific yes'),
    given.simulate('config specific no')
  ])
})

test('config.environment() can filter by regex', async () => {
  config.environment('live', /yes/)
  onGiven('config regex yes', ({ mode }) => {
    t.equal(mode, 'live')
  })
  onGiven('config regex no', ({ mode }) => {
    t.equal(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config regex yes'),
    given.simulate('config regex no')
  ])
})

test(`config.environment('live') will force spec.sim() to spec()`, async () => {
  config.environment('live', 'env forced live also force spec')
  const order = new AssertOrder(1)
  await given.simulate('env forced live also force spec', async ({ spec }) => {
    function success(a, callback) {
      order.once(1)
      callback(null, a + 1)
    }

    const simpleSpec = await spec.simulate('simpleCallback', success)
    const actual = await simpleCallback.increment(simpleSpec.subject, 2)
    t.equal(actual, 3)
  })
  order.end()
})

test('config source to be a remote server', async () => {
  config({
    registry: {
      type: 'server',
      url: 'http://localhost:3000'
    }
  })

  const cbSpec = await spec(simpleCallback.success)
  await simpleCallback.increment(cbSpec.subject, 2)
  await cbSpec.satisfy([
    {
      'type': 'function',
      'name': 'invoke',
      'payload': [2],
      'meta': { 'instanceId': 1, 'invokeId': 1 }
    },
    {
      'type': 'komondor',
      'name': 'callback',
      'payload': [null, 3],
      'meta': {
        'sourceType': 'function',
        'sourceInstanceId': 1,
        'sourceInvokeId': 1,
        'sourcePath': [1]
      }
    },
    {
      'type': 'function',
      'name': 'return',
      'meta': { 'instanceId': 1, 'invokeId': 1 }
    }
  ])
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
