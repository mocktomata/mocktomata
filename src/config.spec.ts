import { test } from 'ava'

import { config, spec } from './index'
import { resetStore } from './store'
import { onEnvironment, environment } from './environment';

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
  console.log('before')
  resetStore()
})

test.afterEach(() => {
  console.log('after')
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

test('config.environment() with no filter sets mode for all environments', async t => {
  config.environment('live')
  onEnvironment('config all 1', ({ mode }) => {
    t.is(mode, 'live')
  })
  onEnvironment('config all 2', ({ mode }) => {
    t.is(mode, 'live')
  })
  console.log(1)
  await environment.simulate('config all 1')
  console.log(2)
  await environment.simulate('config all 2')
  console.log(3)
})

test('config.environment() can filter by string', async t => {
  config.environment('live', 'config specific yes')
  onEnvironment('config specific yes', ({ mode }) => {
    t.is(mode, 'live')
  })
  onEnvironment('config specific no', ({ mode }) => {
    t.is(mode, 'simulate')
  })
  console.log(4)
  await environment.simulate('config specific yes')
  console.log(5)
  await environment.simulate('config specific no')
  console.log(6)
})


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
