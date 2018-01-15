import { test } from 'ava'

import { config, spec } from './index'
import { simpleCallback } from './specTestSuites'
import { store } from './store'

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
  config({ mode: 'replay' })

  t.is(store.mode, 'replay')

  const speced = await spec(simpleCallback.fail, { id: 'simpleCallback', mode: 'verify' })
  const actual = await simpleCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('config mode to work on specific spec', async t => {
  config({ mode: 'replay', spec: 'not exist' })

  const failSpec = await spec(simpleCallback.fail, { id: 'simpleCallback', mode: 'verify' })
  await simpleCallback.increment(failSpec.fn, 2)
    .then(() => t.fail())
    .catch(() => {
      return failSpec.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  config({ mode: 'replay', spec: 'simpleCallback failed' })

  const sucessSpec = await spec(simpleCallback.success, { id: 'simpleCallback failed', mode: 'verify' })
  await simpleCallback.increment(sucessSpec.fn, 2)
    .then(() => t.fail())
    .catch(() => {
      return sucessSpec.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('config mode to work on specific spec using regex', async t => {
  config({ mode: 'replay', spec: /simpl/ })
  const sucessSpec = await spec(simpleCallback.success, { id: 'simpleCallback failed', mode: 'verify' })
  await simpleCallback.increment(sucessSpec.fn, 2)
    .then(() => t.fail())
    .catch(() => {
      return sucessSpec.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})
