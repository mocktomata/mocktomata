import t from 'assert'
import a, { satisfy, AssertOrder } from 'assertron'
import { isFSA } from 'flux-standard-action'

import { spec, SimulationMismatch } from '../index'
import {
  simpleCallback,
  fetch,
  literalCallback,
  synchronous,
  delayed,
  recursive,
  postReturn
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

test('on(event, callback) will invoke when action is simulated.', async () => {
  const order = new AssertOrder()
  const cbSpec = await spec.simulate('simpleCallback', simpleCallback.success)

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

test('onAny(callback) will invoke on any action', async () => {
  const order = new AssertOrder()
  const cbSpec = await spec(simpleCallback.success)

  cbSpec.onAny(action => {
    order.any([1, 2, 3])
    t(isFSA(action))
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('onAny(callback) will invoke when any action is simulated', async () => {
  const order = new AssertOrder()
  const cbSpec = await spec.simulate('simpleCallback', simpleCallback.success)

  cbSpec.onAny(action => {
    order.any([1, 2, 3])
    t(isFSA(action))
  })

  await simpleCallback.increment(cbSpec.subject, 2)
  order.end()
})

test('function spec can be called multiple times', async () => {
  const cbSpec = await spec(delayed.success)
  await delayed.increment(cbSpec.subject, 2)
  await delayed.increment(cbSpec.subject, 4)
  t.equal(cbSpec.actions.length, 6)
})

//#region simpleCallback
test('simpleCallback verify', async () => {
  const cbSpec = await spec(simpleCallback.success)
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})


test('simpleCallback save', async () => {
  const cbSpec = await spec.save('simpleCallback', simpleCallback.success)
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('simpleCallback replay', async () => {
  const cbSpec = await spec.simulate('simpleCallback', simpleCallback.success)
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('simpleCallback fail case verify', async () => {
  const cbSpec = await spec(simpleCallback.fail)
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('simpleCallback fail case save', async () => {
  const cbSpec = await spec.save('simpleCallback failed', simpleCallback.fail)
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('simpleCallback fail case replay', async () => {
  const cbSpec = await spec.simulate('simpleCallback failed', simpleCallback.fail)
  return simpleCallback.increment(cbSpec.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return cbSpec.satisfy([
        { type: 'fn/invoke', payload: [2] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('simulate without record will throw', async () => {
  const noRecordSpec = await spec.simulate('function/simpleCallback/notExist', simpleCallback.success)

  await a.throws(simpleCallback.increment(noRecordSpec.subject, 4), SimulationMismatch)
})

//#endregion

//#region fetch
test('fetch verify', async () => {
  const speced = await spec(fetch.success)
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('fetch save', async () => {
  const speced = await spec.save('fetch', fetch.success)
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('fetch replay', async () => {
  const speced = await spec('fetch', fetch.success)
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
    { type: 'fn/callback', payload: [null, 3] },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('fetch fail verify', async () => {
  const speced = await spec(fetch.fail)
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('fetch fail save', async () => {
  const speced = await spec.save('fetch fail', fetch.fail)
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: ['remoteAdd', { x: 1, y: 2 }] },
        { type: 'fn/callback', payload: [{ message: 'fail' }, null] },
        { type: 'fn/return' }
      ])
    })
})

test('fetch fail verify', async () => {
  const speced = await spec('fetch fail', fetch.fail)
  return fetch.add(speced.subject, 1, 2)
    .then(() => t.fail('should not reach'))
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
test('literalCallback verify', async () => {
  const speced = await spec(literalCallback.success)
  const actual = await literalCallback.increment(speced.subject, 2)
  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: { callbackPath: [0, 'success'] } },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('literalCallback save', async () => {
  const speced = await spec.save('literalCallback', literalCallback.success)
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: { callbackPath: [0, 'success'] } },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('literalCallback replay', async () => {
  const speced = await spec.simulate('literalCallback', literalCallback.success)
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: [{ 'data': 2 }] },
    { type: 'fn/callback', payload: [3], meta: { callbackPath: [0, 'success'] } },
    { type: 'fn/return' }
  ])
  t.equal(actual, 3)
})

test('literalCallback fail case verify', async () => {
  const speced = await spec(literalCallback.fail)
  return literalCallback.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: { callbackPath: [0, 'error'] } },
        { type: 'fn/return' }
      ])
    })
})

test('literalCallback fail case save', async () => {
  const speced = await spec.save('literalCallback fail', literalCallback.fail)
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: { callbackPath: [0, 'error'] } },
        { type: 'fn/return' }
      ])
    })
})

test('literalCallback fail case replay', async () => {
  const speced = await spec.simulate('literalCallback fail', literalCallback.fail)
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail('should not reach'))
    .catch(() => {
      return speced.satisfy([
        { type: 'fn/invoke', payload: [{ 'data': 2 }] },
        { type: 'fn/callback', payload: [undefined, undefined, { message: 'fail' }], meta: { callbackPath: [0, 'error'] } },
        { type: 'fn/return' }
      ])
    })
})
//#endregion

//#region synchronous
test('synchronous verify', async () => {
  const speced = await spec(synchronous.success)
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.equal(actual, 3)
})

test('synchronous save', async () => {
  const speced = await spec.save('synchronous', synchronous.success)
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.equal(actual, 3)
})

test('synchronous replay', async () => {
  const speced = await spec.simulate('synchronous', synchronous.success)
  const actual = synchronous.increment(speced.subject, 2)
  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/return', payload: 3 }
  ])
  t.equal(actual, 3)
})

test('synchronous fail verify', async () => {
  const speced = await spec(synchronous.fail)

  a.throws(() => synchronous.increment(speced.subject, 2), e => e.message === 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

test('synchronous fail save', async () => {
  const speced = await spec.save('synchronous fail', synchronous.fail)

  a.throws(() => synchronous.increment(speced.subject, 2), e => e.message === 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

test('synchronous fail replay', async () => {
  const speced = await spec.simulate('synchronous fail', synchronous.fail)

  a.throws(() => synchronous.increment(speced.subject, 2), e => e.message === 'fail')

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', 2] },
    { type: 'fn/throw', payload: { message: 'fail' } }
  ])
})

//#endregion

test('missing record will throw', async () => {
  const cbSpec = await spec.simulate('function/simpleCallback/incompleteRecords', simpleCallback.success)
  t.equal(await simpleCallback.increment(cbSpec.subject, 2), 3)

  await a.throws(simpleCallback.increment(cbSpec.subject, 4), SimulationMismatch)
})


test('recursive (save)', async () => {
  const cbSpec = await spec.save('function/recursive/twoCalls', recursive.success)
  const actual = await recursive.decrementToZero(cbSpec.subject, 2)
  t.equal(actual, 0)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 1] },
    { type: 'fn/invoke', payload: [1] },
    { type: 'fn/callback', payload: [null, 0] },
    { type: 'fn/return' },
    { type: 'fn/return' }
  ])
})

test('recursive (replay)', async () => {
  const cbSpec = await spec.simulate('function/recursive/twoCalls', recursive.success)
  const actual = await recursive.decrementToZero(cbSpec.subject, 2)
  t.equal(actual, 0)

  await cbSpec.satisfy([
    { type: 'fn/invoke', payload: [2] },
    { type: 'fn/callback', payload: [null, 1] },
    { type: 'fn/invoke', payload: [1] },
    { type: 'fn/callback', payload: [null, 0] },
    { type: 'fn/return' },
    { type: 'fn/return' }
  ])
})

test('postReturn style', async () => {
  const pspec = await spec('function/postReturn/success', postReturn.fireEvent)

  await new Promise(a => {
    let called = 0
    pspec.subject('event', 3, () => {
      called++
      if (called === 3)
        a()
    })
  })

  await pspec.satisfy([
    { type: 'fn/invoke', payload: ['event', 3] },
    { type: 'fn/return' },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] }
  ])
})

test('postReturn style save', async () => {
  const pspec = await spec.save('function/postReturn/success', postReturn.fireEvent)

  await new Promise(a => {
    let called = 0
    pspec.subject('event', 3, () => {
      called++
      if (called === 3)
        a()
    })
  })

  await pspec.satisfy([
    { type: 'fn/invoke', payload: ['event', 3] },
    { type: 'fn/return' },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] }
  ])
})

test('postReturn style simulate', async () => {
  const pspec = await spec.simulate('function/postReturn/success', postReturn.fireEvent)

  await new Promise(a => {
    let called = 0
    pspec.subject('event', 3, () => {
      called++
      if (called === 3)
        a()
    })
  })

  await pspec.satisfy([
    { type: 'fn/invoke', payload: ['event', 3] },
    { type: 'fn/return' },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] },
    { type: 'fn/callback', payload: ['event'] }
  ])
})
