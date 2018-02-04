import { test } from 'ava'

import { config, spec } from './index'
import { store } from './store'

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
  config()
})

test.afterEach(() => {
  config()
})

test('config with no argument set things to default', t => {
  config({ mode: 'save' })
  t.is(store.mode, 'save')

  config()
  t.is(store.mode, undefined)
})


test('config replay will force subsequence spec in replay mode', async t => {
  config({ mode: 'simulate' })

  t.is(store.mode, 'simulate')

  const speced = await spec(simpleCallback.fail, { id: 'config/forceReplaySuccess', mode: 'verify' })
  const actual = await simpleCallback.increment(speced.subject, 2)

  // this should have failed if the spec is running in 'verify' mode.
  // The actual call is failing.
  await speced.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])

  t.is(actual, 3)
})

test('config mode to work on specific spec', async t => {
  config({ mode: 'simulate', spec: 'not exist' })

  const failSpec = await spec(simpleCallback.fail, { id: 'config/forceReplaySuccess', mode: 'verify' })
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
  config({ mode: 'simulate', spec: 'config/forceReplayFail' })

  const sucessSpec = await spec(simpleCallback.success, { id: 'config/forceReplayFail', mode: 'verify' })
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
  t.pass()
})

test('config mode to work on specific spec using regex', async t => {
  config({ mode: 'simulate', spec: /config\/forceReplay/ })
  const sucessSpec = await spec(simpleCallback.success, { id: 'config/forceReplayFail', mode: 'verify' })
  await simpleCallback.increment(sucessSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return sucessSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
  t.pass()
})

test.skip('config to save on remote server', async () => {
  config({
    store: {
      url: 'http://localhost:3000'
    }
  })

  const cbSpec = await spec(simpleCallback.success)
  await simpleCallback.increment(cbSpec.subject, 2)
  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
})
