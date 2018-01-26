import { test } from 'ava'
import { satisfy, AssertOrder } from 'assertron'
import { isFSA } from 'flux-standard-action'

import { spec } from '../spec'
import {
  simpleCallback,
  fetch,
  literalCallback,
  synchronous,
  delayed
} from './testSuites'

test('spec.actions contains all actions recorded', async () => {
  const cbSpec = await spec(simpleCallback.success)
  await simpleCallback.increment(cbSpec.subject, 2)
  satisfy(cbSpec.actions, [
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
})

test('on(event, callback) will invoke when action is added.', async () => {
  const order = new AssertOrder()
  const cbSpec = await spec(simpleCallback.success)

  cbSpec.on('fn/invoke', action => {
    order.once(1)
    satisfy(action, { payload: [2] })
  })
  cbSpec.on('fn/callback', action => {
    order.once(2)
    satisfy(action, { payload: [null, 3] } as any)
  })
  cbSpec.on('fn/return', () => {
    order.once(3)
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('on(event, callback) will invoke when action is replay.', async () => {
  const order = new AssertOrder()
  const cbSpec = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })

  cbSpec.on('fn/invoke', action => {
    order.once(1)
    satisfy(action, { payload: [2] })
  })
  cbSpec.on('fn/callback', action => {
    order.once(2)
    satisfy(action, { payload: [null, 3] } as any)
  })
  cbSpec.on('fn/return', () => {
    order.once(3)
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('onAny(callback) will invoke on any action', async t => {
  const order = new AssertOrder()
  const cbSpec = await spec(simpleCallback.success)

  cbSpec.onAny(action => {
    order.any([1, 2, 3])
    t.true(isFSA(action))
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('onAny(callback) will invoke when any action is replay', async t => {
  const order = new AssertOrder()
  const cbSpec = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })

  cbSpec.onAny(action => {
    order.any([1, 2, 3])
    t.true(isFSA(action))
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('function spec can be called multiple times', async t => {
  const cbSpec = await spec(delayed.success)
  await delayed.increment(cbSpec.subject, 2)
  await delayed.increment(cbSpec.subject, 4)
  t.is(cbSpec.actions.length, 6)
})

//#region simpleCallback
test('simpleCallback verify', async t => {
  const cbSpec = await spec(simpleCallback.success)
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})


test('simpleCallback save', async t => {
  const cbSpec = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'save' })
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('simpleCallback replay', async t => {
  const cbSpec = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('simpleCallback fail case verify', async t => {
  const cbSpec = await spec(simpleCallback.fail)
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('simpleCallback fail case save', async t => {
  const cbSpec = await spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'save' })
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('simpleCallback fail case replay', async t => {
  const cbSpec = await spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'replay' })
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('replay on not saved input will spy', async t => {
  const successSpec = await spec(simpleCallback.success, { id: 'function/simpleCallback/notSavedToSpy', mode: 'replay' })

  const actual = await simpleCallback.increment(successSpec.subject, 4)
  await successSpec.satisfy([
    { type: 'fn/invoke', payload: [4] },
    { type: 'fn/callback', payload: [null, 5] },
    { type: 'fn/return' }
  ])
  t.is(actual, 5)

  const failSpec = await spec(simpleCallback.fail, { id: 'function/simpleCallback failed/notSavedToSpy', mode: 'replay' })
  await simpleCallback.increment(failSpec.subject, 8)
    .then(() => t.fail())
    .catch(() => {
      return failSpec.satisfy([
        { type: 'fn/invoke', payload: [8] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

//#endregion

//#region fetch
test('fetch verify', async t => {
  const speced = await spec(fetch.success)
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('fetch save', async t => {
  const speced = await spec(fetch.success, { id: 'fetch', mode: 'save' })
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('fetch replay', async t => {
  const speced = await spec(fetch.success, { id: 'fetch', mode: 'replay' })
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('fetch fail verify', async t => {
  const speced = await spec(fetch.fail)
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('fetch fail save', async t => {
  const speced = await spec(fetch.fail, { id: 'fetch fail', mode: 'save' })
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('fetch fail verify', async t => {
  const speced = await spec(fetch.fail, { id: 'fetch fail', mode: 'verify' })
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})
//#endregion

//#region literalCallback
test('literalCallback verify', async t => {
  const speced = await spec(literalCallback.success)
  const actual = await literalCallback.increment(speced.subject, 2)
  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: [0, 'success'] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('literalCallback save', async t => {
  const speced = await spec(literalCallback.success, { id: 'literalCallback', mode: 'save' })
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: [0, 'success'] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('literalCallback replay', async t => {
  const speced = await spec(literalCallback.success, { id: 'literalCallback', mode: 'replay' })
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: [0, 'success'] },
    { type: 'fn/return' }
  ])
  t.is(actual, 3)
})

test('literalCallback fail case verify', async t => {
  const speced = await spec(literalCallback.fail)
  return literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: [0, 'error'] },
        { type: 'fn/return' }
      ])
    })
})

test('literalCallback fail case save', async t => {
  const speced = await spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'save' })
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: [0, 'error'] },
        { type: 'fn/return' }
      ])
    })
  t.pass()
})

test('literalCallback fail case replay', async t => {
  const speced = await spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'replay' })
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: [0, 'error'] },
        { type: 'fn/return' }
      ])
    })
  t.pass()
})
//#endregion

//#region synchronous
test('synchronous verify', async t => {
  const speced = await spec(synchronous.success)
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.is(actual, 3)
})

test('synchronous save', async t => {
  const speced = await spec(synchronous.success, { id: 'synchronous', mode: 'save' })
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.is(actual, 3)
})

test('synchronous replay', async t => {
  const speced = await spec(synchronous.success, { id: 'synchronous', mode: 'replay' })
  const actual = synchronous.increment(speced.subject, 2)
  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.is(actual, 3)
})

test('synchronous fail verify', async t => {
  const speced = await spec(synchronous.fail)

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

test('synchronous fail save', async t => {
  const speced = await spec(synchronous.fail, { id: 'synchronous fail', mode: 'save' })

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

test('synchronous fail replay', async t => {
  const speced = await spec(synchronous.fail, { id: 'synchronous fail', mode: 'replay' })

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

//#endregion

test('simpleCallback call again will turn into spy mode', async t => {
  const cbSpec = await spec(simpleCallback.success, { id: 'function/simpleCallback/callAgainToSpy', mode: 'replay' })
  const actual = await simpleCallback.increment(cbSpec.subject, 2)
  t.is(actual, 3)

  const actual2 = await simpleCallback.increment(cbSpec.subject, 4)
  t.is(actual2, 5)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' },
    { type: 'fn/invoke', payload: [4] },
    { type: 'fn/callback', payload: [null, 5] },
    { type: 'fn/return' }
  ])
})
