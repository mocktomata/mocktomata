// import { AssertOrder } from 'assertron'
import { test } from 'ava'

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

test.beforeEach(() => {
  resetStore()
})

test.afterEach(() => {
  resetStore()
})

test(`config.spec('simulate') will force all specs in simulate mode`, async t => {
  config.spec('simulate')

  const speced = await spec('config/forceReplaySuccess', simpleCallback.fail)
  const actual = await simpleCallback.increment(speced.subject, 2)

  // this should have failed if the spec is running in 'live' mode.
  // The actual call is failing.
  await speced.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])

  t.is(actual, 3)
})

test('config.spec() can filter for specific spec', async t => {
  config.spec('simulate', 'not exist - no effect')

  const failSpec = await spec('config/forceReplaySuccess', simpleCallback.fail)
  await simpleCallback.increment(failSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      // this should fail if the spec is in 'replay' mode.
      // The saved record is succeeding.
      return failSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
  config.spec('simulate', 'config/forceReplayFail')

  const sucessSpec = await spec('config/forceReplayFail', simpleCallback.success)
  await simpleCallback.increment(sucessSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      // this should fail if the spec is in 'verify' mode.
      // The save record is failing.
      return sucessSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('config.spec() can filter using regex', async t => {
  config.spec('simulate', /config\/forceReplay/)
  const sucessSpec = await spec('config/forceReplayFail', simpleCallback.success)
  await simpleCallback.increment(sucessSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return sucessSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test(`config.spec() can use 'live' mode to switch spec in simulation to make live call`, async t => {
  config.spec('live')
  const sucessSpec = await spec.simulate('config/forceReplayFail', simpleCallback.success)
  const actual = await simpleCallback.increment(sucessSpec.subject, 2)
  t.is(actual, 3)

  await sucessSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
})

test(`config.spec('save'|'simulate') will cause spec with no id to throw`, async t => {
  config.spec('save')
  const err: MissingSpecID = await t.throws(spec(simpleCallback.success), MissingSpecID)
  t.is(err.mode, 'save')

  config.spec('simulate')
  const err2: MissingSpecID = await t.throws(spec(simpleCallback.success), MissingSpecID)
  t.is(err2.mode, 'simulate')
})


test('config.environment() with no filter sets mode for all environments', async t => {
  config.environment('live')
  onGiven('config all 1', ({ mode }) => {
    t.is(mode, 'live')
  })
  onGiven('config all 2', ({ mode }) => {
    t.is(mode, 'live')
  })
  return Promise.all([
    given.simulate('config all 1'),
    given.simulate('config all 2')
  ])
})

test('config.environment() can filter by string', async t => {
  config.environment('live', 'config specific yes')
  onGiven('config specific yes', ({ mode }) => {
    t.is(mode, 'live')
  })
  onGiven('config specific no', ({ mode }) => {
    t.is(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config specific yes'),
    given.simulate('config specific no')
  ])
})

test('config.environment() can filter by regex', async t => {
  config.environment('live', /yes/)
  onGiven('config regex yes', ({ mode }) => {
    t.is(mode, 'live')
  })
  onGiven('config regex no', ({ mode }) => {
    t.is(mode, 'simulate')
  })
  return Promise.all([
    given.simulate('config regex yes'),
    given.simulate('config regex no')
  ])
})

/*
env.save:
  this will save the EnvironmentRecord
  if linked spec is in live mode, it will also save.
  if linked spec is in simulate mode, it will stay in simulate mode.
*/


// test('', () => {
//   return environment.simulate([
//     'normal load',
//     'admin',
//     'login',
//     '...'
//   ], (context, fixture) => {
//     context
//   })
// })
// test(`config.environment('live') will `, async t => {
//   config.environment('live', 'env forced live also force spec')
//   const order = new AssertOrder(1)
//   onEnvironment('env forced live also force spec', () => ({}))
//   await environment.simulate('env forced live also force spec', async ({ spec }) => {
//     function success(a, callback) {
//       order.once(1)
//       callback(null, a + 1)
//     }

//     const simpleSpec = await spec.simulate('simpleCallback', success)
//     const actual = await simpleCallback.increment(simpleSpec.subject, 2)
//     t.is(actual, 3)

//     order.end()
//   })
// })

// test.skip('config to save on remote server', async () => {
//   config({
//     store: {
//       url: 'http://localhost:3000'
//     }
//   })

//   const cbSpec = await spec(simpleCallback.success)
//   await simpleCallback.increment(cbSpec.subject, 2)
//   await cbSpec.satisfy([
//     { type: 'fn/invoke', payload: [2] },
//     { type: 'fn/callback', payload: [null, 3] },
//     { type: 'fn/return' }
//   ])
// })
