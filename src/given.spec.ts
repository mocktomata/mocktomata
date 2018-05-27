import t from 'assert'
import a, { AssertOrder } from 'assertron'

import fs from 'fs'
import path from 'path'

import { GIVENS_FOLDER, SPECS_FOLDER } from './constants'
import {
  DuplicateGivenHandler,
  functionConstructed,
  functionInvoked,
  given,
  GivenSaveRequireSpecId,
  InvalidID,
  MissingGivenHandler,
  onGiven
} from '.'

// test(`
// Given Cavern 1 connects to Cavern 2 going West
// Given the player is in Cavern 1
// When the player goes West
// Then the player is in Cavern 2
// `, async () => {
//     onGiven('cavern {number}', ({}, cavernId) => {
//       return { id: cavernId }
//     })
//     const cavern1 = await given('cavern 1')
//     const cavern2 = await given('cavern 2')
//     cavern1.west = cavern2

//     const player = await given('player')
//     cavern1.objects = [player]

//     const game = new Game([cavern1, cavern2], player)
//     game.playerMove('west')
//     t.equal(cavern1.objects.length, 0)
//     t.equal(cavern2.objects[0], player)
//   })

test('no handler registered throws MissingGivenHandler', async () => {
  await a.throws(given('no handler'), MissingGivenHandler)
})

test('handler will be invoked', async () => {
  const order = new AssertOrder(1)
  onGiven('invoking handler', () => order.once(1))

  await given('invoking handler')

  order.end()
})

test('duplicate handler will throws', async () => {
  onGiven('dup handler', () => { return })
  await a.throws(() => onGiven('dup handler', () => { return }), DuplicateGivenHandler)
})

test('handler can be registered using regex', async () => {
  const order = new AssertOrder(1)
  onGiven(/reg using reg/, () => order.once(1))

  await given('reg using regex')

  order.end()
})

test('duplicate regex handler will throws', async () => {
  onGiven(/dup regex handler/, () => { return })
  await a.throws(() => onGiven(/dup regex handler/, () => { return }), DuplicateGivenHandler)
})

test('using given twice will only invoke handler once', async () => {
  const order = new AssertOrder(1)
  onGiven('invoke once', () => {
    order.once(1)
    return { a: 1 }
  })

  t.deepEqual((await given('invoke once')).fixture, { a: 1 })

  // in another test
  t.deepEqual((await given('invoke once')).fixture, { a: 1 })

  order.end()
})

test('resulting env.fixture contains information provided by the handler', async () => {
  onGiven('returning context', () => ({ a: 1 }))

  const actual = await given<{ a: number }>('returning context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('receives async given context from the handler', async () => {
  onGiven('returning async context', () => Promise.resolve({ a: 1 }))

  const actual = await given<{ a: number }>('returning async context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('with localHandler, MissingGivenHandler will not be thrown', () => {
  return given('no throw with localHandler', () => { return })
})

test('define localHandler while already has a handler throws DupHandler error', async () => {
  onGiven('invoke localHandler', () => t.fail('should not reach'))

  await a.throws(given('invoke localHandler', () => { return }), DuplicateGivenHandler)
})

test('receive context from localHandler', async () => {
  const actual = await given('returning localHandler context', () => ({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})

test('receive async context from localHandler', async () => {
  const actual = await given<{ b: number }>(
    'returning async localHandler context',
    () => Promise.resolve({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})

test('given.simulate() calls handler with mode = simulate', async () => {
  const o = new AssertOrder(1)
  onGiven('simulate mode', ({ mode }) => {
    o.once(1)
    t.equal(mode, 'simulate')
  })

  await given.simulate('simulate mode')
  o.end()
})

test('given.simulate() calls local handler with mode = simulate', async () => {
  const o = new AssertOrder(1)

  await given.simulate('simulate mode with local handler', ({ mode }) => {
    o.once(1)
    t.equal(mode, 'simulate')
  })
  o.end()
})

test('given.simulate() will force spec to simulate', async () => {
  function success(_a, _cb) {
    // the original line to create the spec
    // _cb(null, _a + 1)
    t.fail('should not reach')
  }
  onGiven('simulate calling env', async ({ mode, spec }) => {
    t.equal(mode, 'simulate')
    const s = await spec('given/simulate/spec', success)
    s.subject(2, (_, a) => t.equal(a, 3))

    return s.satisfy([
      functionConstructed(),
      functionInvoked(2),
      functionConstructed(),
      { payload: [undefined, 3] }])
  })

  await given.simulate('simulate calling env')
})

test('given.simulate() will force spec in localHandler to simulate', async () => {
  function success(_a, _cb) {
    // the original line to create the spec
    // _cb(null, _a + 1)
    t.fail('should not reach')
  }

  await given.simulate('simulate calling env with localHandler', async ({ mode, spec }) => {
    t.equal(mode, 'simulate')
    const s = await spec('given/simulate/spec', success)
    s.subject(2, (_, a) => t.equal(a, 3))

    return s.satisfy([
      functionConstructed(),
      functionInvoked(),
      functionConstructed(),
      { payload: [undefined, 3] }])
  })
})

test('local context contains spec', async () => {
  await given('local context has spec', ({ spec }) => t(spec))
})

test('save() without global handler throws', async () => {
  await a.throws(given.save('no handler with save'), MissingGivenHandler)
})

test('save() with duplicate regex handler will throws', async () => {
  onGiven('dup handler for save', () => t.fail('should not reach'))

  await a.throws(given.save('dup handler for save', () => { return }), DuplicateGivenHandler)
})

test('save() will save record', async () => {
  await given.save('save record', () => { return })
  t(fs.existsSync(path.resolve(GIVENS_FOLDER, 'save record.json')))
})

test('save() with no-id-spec will throw', async () => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  await a.throws(given.save('save with no-id-spec', async ({ spec }) => {
    await spec(success)
  }), GivenSaveRequireSpecId)
})

test('save() with no-id-spec in global handler will throw', async () => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  onGiven('save with no-id-spec in global handler', async ({ spec }) => {
    await spec(success)
  })
  await a.throws(given.save('save with no-id-spec in global handler'), GivenSaveRequireSpecId)
})

test('save() will record specs used', async () => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  await given.save('save record with spec', async ({ spec }) => {
    const cbSpec = await spec('given/with spec', success)
    cbSpec.subject(2, (_err, a) => t.equal(a, 3))
    await cbSpec.satisfy([])
  })
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec.json'), 'utf-8'))
  t.equal(actual.specs[0], 'given/with spec')
  t(fs.existsSync(path.resolve(SPECS_FOLDER, 'given/with spec.json')))
})

test('save() will save spec info from global handler', async () => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  onGiven('save record with spec in global handler', async ({ spec }) => {
    const cbSpec = await spec('given/with spec in global handler', success)
    cbSpec.subject(2, (_err, a) => t.equal(a, 3))
    await cbSpec.satisfy([])
  })
  await given.save('save record with spec in global handler')
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec in global handler.json'), 'utf-8'))
  t.equal(actual.specs[0], 'given/with spec in global handler')
  t(fs.existsSync(path.resolve(SPECS_FOLDER, 'given/with spec in global handler.json')))
})

test('save() will not cause spec.simulate() to save', async () => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  const specPath = path.resolve(SPECS_FOLDER, 'given/with spec.simulate.json')
  const stats = fs.statSync(specPath)
  await given.save('save record with spec.simulate', async ({ spec }) => {
    const cbSpec = await spec.simulate('given/with spec.simulate', success)
    cbSpec.subject(2, (_err, a) => t.equal(a, 3))
    await cbSpec.satisfy([])
  })
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec.simulate.json'), 'utf-8'))
  t.equal(actual.specs[0], 'given/with spec.simulate')
  const newStats = fs.statSync(specPath)
  t.equal(stats.mtime.getTime(), newStats.mtime.getTime())
})

test('calling live after simulate should invoke handler', async () => {
  const o = new AssertOrder(2)
  onGiven('live after sim', ({ mode }) => {
    o.wait(1).then(() => t.equal(mode, 'simulate'))
    o.wait(2).then(() => t.equal(mode, 'live'))
    o.any([1, 2])
  })

  await given.simulate('live after sim')
  await given('live after sim')

  o.end()
})

test('given id containing invalid path character should throw', () => {
  return Promise.all([
    'a > b',
    'new: some-condition'
  ].map(p => {
    return Promise.all([
      a.throws(() => given(p, () => ({})), InvalidID),
      a.throws(() => given.save(p, () => ({})), InvalidID),
      a.throws(() => given.simulate(p, () => ({})), InvalidID)
    ])
  }))
})
