import { test } from 'ava'

import { spec } from './spec'
import { fetch, promise, simpleCallback, literalCallback, synchronous } from './specTestSuites'

//#region simpleCallback
test('simpleCallback verify', async t => {
  const cbSpec = await spec(simpleCallback.success)
  const actual = await simpleCallback.increment(cbSpec.subject, 2)

  const record = await cbSpec.calls[0].getCallRecord()

  // const recordShouldBe = {
  //   id: 'simpleCallback',
  //   actions: [
  //     { type: 'call', payload: [2, {}], meta: 'input' },
  //     { type: 'callback', payload: [null, 3] },
  //     { type: 'return', paylaod: undefined, meta: 'output' }
  //   ]
  // }
  console.log(record)
  await cbSpec.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback save', async t => {
  const speced = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'save' })
  const actual = await simpleCallback.increment(speced.subject, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback replay', async t => {
  const speced = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })
  const actual = await simpleCallback.increment(speced.subject, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('simpleCallback fail case verify', async t => {
  const speced = await spec(simpleCallback.fail)
  await simpleCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('simpleCallback fail case save', async t => {
  const speced = await spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'save' })
  await simpleCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('simpleCallback fail case replay', async t => {
  const speced = await spec(simpleCallback.fail, { id: 'simpleCallback failed', mode: 'replay' })
  await simpleCallback.increment(speced.subject, 2)
    .then(() => t.fail())
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
  const speced = await spec(fetch.success)
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch save', async t => {
  const speced = await spec(fetch.success, { id: 'fetch', mode: 'save' })
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch replay', async t => {
  const speced = await spec(fetch.success, { id: 'fetch', mode: 'replay' })
  const actual = await fetch.add(speced.subject, 1, 2)

  await speced.satisfy({
    asyncOutput: [null, 3]
  })
  t.is(actual, 3)
})

test('fetch fail verify', async t => {
  const speced = await spec(fetch.fail)
  await fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('fetch fail save', async t => {
  const speced = await spec(fetch.fail, { id: 'fetch fail', mode: 'save' })
  await fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
  t.pass()
})

test('fetch fail verify', async t => {
  const speced = await spec(fetch.fail, { id: 'fetch fail', mode: 'verify' })
  await fetch.add(speced.subject, 1, 2)
    .then(() => t.fail())
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
  const speced = await spec(literalCallback.success)
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback save', async t => {
  const speced = await spec(literalCallback.success, { id: 'literalCallback', mode: 'save' })
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback replay', async t => {
  const speced = await spec(literalCallback.success, { id: 'literalCallback', mode: 'replay' })
  const actual = await literalCallback.increment(speced.subject, 2)

  await speced.satisfy({
    asyncOutput: [3]
  })
  t.is(actual, 3)
})

test('literalCallback fail case verify', async t => {
  const speced = await spec(literalCallback.fail)
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [undefined, undefined, { message: 'fail' }]
      })
    })
  t.pass()
})

test('literalCallback fail case save', async t => {
  const speced = await spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'save' })
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncOutput: [undefined, undefined, { message: 'fail' }]
      })
    })
  t.pass()
})

test('literalCallback fail case replay', async t => {
  const speced = await spec(literalCallback.fail, { id: 'literalCallback fail', mode: 'replay' })
  await literalCallback.increment(speced.subject, 2)
    .then(() => t.fail())
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
  const speced = await spec(promise.success)
  // not using `await` to make sure the return value is a promise.
  // `await` will hide the error if the return value is not a promise.
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy({
        asyncOutput: 3
      })
    })
})

test('promise verify save', async t => {
  const speced = await spec(promise.success, { id: 'promise', mode: 'save' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy({
        asyncOutput: 3
      })
    })
})

test('promise verify replay', async t => {
  const speced = await spec(promise.success, { id: 'promise', mode: 'replay' })
  return promise.increment(speced.subject, 2)
    .then(actual => {
      t.is(actual, 3)
      return speced.satisfy({
        asyncOutput: 3
      })
    })
})

test('promise rejected verify', async t => {
  const speced = await spec(promise.fail)
  await promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})

test('promise rejected save', async t => {
  const speced = await spec(promise.fail, { id: 'promise fail', mode: 'save' })
  await promise.increment(speced.subject, 2)
    .then(() => t.fail())
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})

test('promise rejected replay', async t => {
  const speced = await spec(promise.fail, { id: 'promise fail', mode: 'replay' })
  await promise.increment(speced.subject, 2)
    .then(t.fail)
    .catch(() => {
      return speced.satisfy({
        asyncError: { message: 'fail' }
      })
    })
  t.pass()
})
//#endregion

//#region synchronous
test('synchronous verify', async t => {
  const speced = await spec(synchronous.success)
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy({
    output: 3
  })
  t.is(actual, 3)
})

test('synchronous save', async t => {
  const speced = await spec(synchronous.success, { id: 'synchronous', mode: 'save' })
  const actual = synchronous.increment(speced.subject, 2)

  await speced.satisfy({
    output: 3
  })
  t.is(actual, 3)
})

test('synchronous replay', async t => {
  const speced = await spec(synchronous.success, { id: 'synchronous', mode: 'replay' })
  const actual = synchronous.increment(speced.subject, 2)
  await speced.satisfy({
    output: 3
  })
  t.is(actual, 3)
})

test('synchronous fail verify', async t => {
  const speced = await spec(synchronous.fail)

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy({
    error: { message: 'fail' }
  })
})

test('synchronous fail save', async t => {
  const speced = await spec(synchronous.fail, { id: 'synchronous fail', mode: 'save' })

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy({
    error: { message: 'fail' }
  })
})

test('synchronous fail replay', async t => {
  const speced = await spec(synchronous.fail, { id: 'synchronous fail', mode: 'replay' })

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy({
    error: { message: 'fail' }
  })
})

//#endregion

test('replay on not saved spec will spy', async t => {
  const speced = await spec(synchronous.fail, { id: 'unknown', mode: 'replay' })

  t.throws(() => synchronous.increment(speced.subject, 2), 'fail')

  await speced.satisfy({
    error: { message: 'fail' }
  })
})


test('replay on not saved input will spy', async t => {
  const successSpec = await spec(simpleCallback.success, { id: 'simpleCallback', mode: 'replay' })

  const actual = await simpleCallback.increment(successSpec.subject, 4)

  t.is(successSpec.calls.length, 1)
  await successSpec.satisfy({
    asyncOutput: [null, 5]
  })
  t.is(actual, 5)

  const failSpec = await spec(simpleCallback.fail, { id: 'simpleCallback', mode: 'replay' })
  await simpleCallback.increment(failSpec.subject, 8)
    .then(() => t.fail())
    .catch(() => {
      return failSpec.satisfy({
        asyncOutput: [{ message: 'fail' }, null]
      })
    })
})
