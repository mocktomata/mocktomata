import { test } from 'ava'

import { spec } from './spec'
import {
  childProcess
} from './specTestSuites'

test('childProcess verify', async t => {
  const speced = await spec(childProcess.spawnSuccess)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess save', async t => {
  const speced = await spec(childProcess.spawnSuccess, { id: 'childProcess/success', mode: 'save' })
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess replay', async t => {
  const speced = await spec(childProcess.spawnSuccess, { id: 'childProcess/success', mode: 'replay' })
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case verify', async t => {
  const speced = await spec(childProcess.spawnFail)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case save', async t => {
  const speced = await spec(childProcess.spawnFail, { id: 'childProcess/fail', mode: 'save' })
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case replay', async t => {
  const speced = await spec(childProcess.spawnFail, { id: 'childProcess/fail', mode: 'replay' })
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'invoke', payload: ['increment', [2]] },
    { type: 'return', payload: {}, meta: { type: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})
