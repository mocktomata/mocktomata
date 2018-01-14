import { test } from 'ava'

import { spec } from './spec'

import { fetch, promise, simpleCallback, literalCallback } from './specTestSuites'

//#region simpleCallback
test('simpleCallback verify', async t => {
  const speced = spec(simpleCallback.success)
  const actual = await simpleCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback save', async t => {
  const speced = spec(simpleCallback.success, { id: 'simpleCallback', mode: 'save' })
  const actual = await simpleCallback.increment(speced.fn, 2)

  speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback replay', async t => {
  const speced = spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })
  const actual = await simpleCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback fail case verify', async t => {
  const speced = spec(simpleCallback.fail)
  await simpleCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('simpleCallback fail case save', async t => {
  const speced = spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'save' })
  await simpleCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('simpleCallback fail case replay', async t => {
  const speced = spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'replay' })
  await simpleCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})
//#endregion

//#region fetch
test('fetch verify', async t => {
  const speced = spec(fetch.success)
  const actual = await fetch.add(speced.fn, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch save', async t => {
  const speced = spec(fetch.success, { id: 'fetch', mode: 'save' })
  const actual = await fetch.add(speced.fn, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch replay', async t => {
  const speced = spec(fetch.success, { id: 'fetch', mode: 'replay' })
  const actual = await fetch.add(speced.fn, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch fail verify', async t => {
  const speced = spec(fetch.fail)
  await fetch.add(speced.fn, 1, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('fetch fail save', async t => {
  const speced = spec(fetch.fail, { id: 'fetch fail', mode: 'save' })
  await fetch.add(speced.fn, 1, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('fetch fail verify', async t => {
  const speced = spec(fetch.fail, { id: 'fetch fail', mode: 'verify' })
  await fetch.add(speced.fn, 1, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})
//#endregion

//#region literalCallback
test('literalCallback verify', async t => {
  const speced = spec(literalCallback.success)
  const actual = await literalCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback save', async t => {
  const speced = spec(literalCallback.success, { id: 'literalCallback', mode: 'save' })
  const actual = await literalCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback replay', async t => {
  const speced = spec(literalCallback.success, { id: 'literalCallback', mode: 'replay' })
  const actual = await literalCallback.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback fail case verify', async t => {
  const speced = spec(literalCallback.fail)
  await literalCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [undefined, undefined, { message: 'fail' }]
      })
    })
  t.pass()
})

test('literalCallback fail case save', async t => {
  const speced = spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'save' })
  await literalCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [undefined, undefined, { message: 'fail' }]
      })
    })
  t.pass()
})

test('literalCallback fail case replay', async t => {
  const speced = spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'replay' })
  await literalCallback.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [undefined, undefined, { message: 'fail' }]
      })
    })
  t.pass()
})

//#endregion

//#region promise
test('promise verify', async t => {
  const speced = spec(promise.success)
  const actual = await promise.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: 3
  })
  t.is(actual, 3)
})

test('promise verify save', async t => {
  const speced = spec(promise.success, { id: 'promise', mode: 'save' })
  const actual = await promise.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: 3
  })
  t.is(actual, 3)
})

test('promise verify replay', async t => {
  const speced = spec(promise.success, { id: 'promise', mode: 'replay' })
  const actual = await promise.increment(speced.fn, 2)

  await speced.satisfy({
    asyncOutput: 3
  })
  t.is(actual, 3)
})

test('promise rejected verify', async t => {
  const speced = spec(promise.fail)
  await promise.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})

test('promise rejected save', async t => {
  const speced = spec(promise.fail, { id: 'promise fail', mode: 'save' })
  await promise.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})

test('promise rejected replay', async t => {
  const speced = spec(promise.fail, { id: 'promise fail', mode: 'replay' })
  await promise.increment(speced.fn, 2)
    .then(() => t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})
//#endregion
