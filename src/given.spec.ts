import { AssertOrder } from 'assertron'
import { test } from 'ava'
import fs from 'fs'
import path from 'path'

import { onGiven, given } from './given'
import { MissingGivenHandler, DuplicateGivenHandler, GivenSaveRequireSpecId } from './errors'
import { GIVENS_FOLDER, SPECS_FOLDER } from './constants';

test('no handler registered throws MissingGivenHandler', async t => {
  await t.throws(given('no handler'), MissingGivenHandler)
})

test('handler will be invoked', async () => {
  const order = new AssertOrder(1)
  onGiven('invoking handler', () => order.once(1))

  await given('invoking handler')

  order.end()
})

test('duplicate handler will throws', async t => {
  onGiven('dup handler', () => { return })
  await t.throws(() => onGiven('dup handler', () => { return }), DuplicateGivenHandler)
})

test('handler can be registered using regex', async () => {
  const order = new AssertOrder(1)
  onGiven(/reg using reg/, () => order.once(1))

  await given('reg using regex')

  order.end()
})

test('duplicate regex handler will throws', async t => {
  onGiven(/dup regex handler/, () => { return })
  await t.throws(() => onGiven(/dup regex handler/, () => { return }), DuplicateGivenHandler)
})

test('using given twice will only invoke handler once', async () => {
  const order = new AssertOrder(1)
  onGiven('invoke once', () => order.once(1))

  await given('invoke once')

  // in another test
  await given('invoke once')

  order.end()
})

test('resulting env.fixture contains information provided by the handler', async t => {
  onGiven('returning context', () => ({ a: 1 }))

  const actual = await given<{ a: number }>('returning context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('receives async given context from the handler', async t => {
  onGiven('returning async context', () => Promise.resolve({ a: 1 }))

  const actual = await given<{ a: number }>('returning async context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('with localHandler, MissingGivenHandler will not be thrown', () => {
  return given('no throw with localHandler', () => { return })
})

test('define localHandler while already has a handler throws DupHandler error', async t => {
  onGiven('invoke localHandler', () => t.fail('should not reach'))

  await t.throws(given('invoke localHandler', () => { return }), DuplicateGivenHandler)
})

test('receive context from localHandler', async t => {
  const actual = await given('returning localHandler context', () => ({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})


test('receive async context from localHandler', async t => {
  const actual = await given<{ b: number }>(
    'returning async localHandler context',
    () => Promise.resolve({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})

test('given.simulate() calls handler with mode = simulate', async t => {
  const o = new AssertOrder(1)
  onGiven('simulate mode', ({ mode }) => {
    o.once(1)
    t.is(mode, 'simulate')
  })

  await given.simulate('simulate mode')
  o.end()
})

test('given.simulate() calls local handler with mode = simulate', async t => {
  const o = new AssertOrder(1)

  await given.simulate('simulate mode with local handler', ({ mode }) => {
    o.once(1)
    t.is(mode, 'simulate')
  })
  o.end()
})

test('given.simulate() will force spec to simulate', async t => {
  function success(_a, _cb) {
    // the original line to create the spec
    // callback(null, a + 1)
    t.fail('should not reach')
  }
  onGiven('simulate calling env', async ({ mode, spec }) => {
    t.is(mode, 'simulate')
    const cbSpec = await spec('environment/simulate/spec', success)
    cbSpec.subject(2, (_, a) => t.is(a, 3))

    return cbSpec.satisfy([undefined, { payload: [undefined, 3] }])
  })

  await given.simulate('simulate calling env')
})

test('given.simulate() will force spec in localHandler to simulate', async t => {
  function success(_a, _cb) {
    // the original line to create the spec
    // callback(null, a + 1)
    t.fail('should not reach')
  }

  await given.simulate('simulate calling env with localHandler', async ({ mode, spec }) => {
    t.is(mode, 'simulate')
    const cbSpec = await spec('environment/simulate/spec', success)
    cbSpec.subject(2, (_, a) => t.is(a, 3))

    return cbSpec.satisfy([undefined, { payload: [undefined, 3] }])
  })
})

test('lcoal context contains spec', async t => {
  await given('local context has spec', ({ spec }) => t.truthy(spec))
})

test('save() will save record', async t => {
  await given.save('save record', () => { return })
  t.true(fs.existsSync(path.resolve(GIVENS_FOLDER, 'save record.json')))
})
test('save() with no-id-spec will throw', async t => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  await t.throws(given.save('save with no-id-spec', async ({ spec }) => {
    await spec(success)
  }), GivenSaveRequireSpecId)
})

test('save() with no-id-spec in global handler will throw', async t => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  onGiven('save with no-id-spec in global handler', async ({ spec }) => {
    await spec(success)
  })
  await t.throws(given.save('save with no-id-spec in global handler'), GivenSaveRequireSpecId)
})

test('save() will record specs used', async t => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  await given.save('save record with spec', async ({ spec }) => {
    const cbSpec = await spec('given/with spec', success)
    cbSpec.subject(2, (_err, a) => t.is(a, 3))
    await cbSpec.satisfy({})
  })
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec.json'), 'utf-8'))
  t.is(actual.specs[0], 'given/with spec')
  t.true(fs.existsSync(path.resolve(SPECS_FOLDER, 'given/with spec.json')))
})

test('save() will save spec info from global handler', async t => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  onGiven('save record with spec in global handler', async ({ spec }) => {
    const cbSpec = await spec('given/with spec in global handler', success)
    cbSpec.subject(2, (_err, a) => t.is(a, 3))
    await cbSpec.satisfy({})
  })
  await given.save('save record with spec in global handler')
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec in global handler.json'), 'utf-8'))
  t.is(actual.specs[0], 'given/with spec in global handler')
  t.true(fs.existsSync(path.resolve(SPECS_FOLDER, 'given/with spec in global handler.json')))
})

test('save() will not cause spec.simulate() to save', async t => {
  function success(a, callback) {
    callback(null, a + 1)
  }
  const specPath = path.resolve(SPECS_FOLDER, 'given/with spec.simulate.json')
  const stats = fs.statSync(specPath)
  await given.save('save record with spec.simulate', async ({ spec }) => {
    const cbSpec = await spec.simulate('given/with spec.simulate', success)
    cbSpec.subject(2, (_err, a) => t.is(a, 3))
    await cbSpec.satisfy({})
  })
  const actual = JSON.parse(fs.readFileSync(path.resolve(GIVENS_FOLDER, 'save record with spec.simulate.json'), 'utf-8'))
  t.is(actual.specs[0], 'given/with spec.simulate')
  const newStats = fs.statSync(specPath)
  t.is(stats.mtime.getTime(), newStats.mtime.getTime())
})

test('calling live after simulate should invoke handler', async t => {
  const o = new AssertOrder(2)
  onGiven('live after sim', ({ mode }) => {
    o.wait(1).then(() => t.is(mode, 'simulate'))
    o.wait(2).then(() => t.is(mode, 'live'))
    o.any([1, 2])
  })

  await given.simulate('live after sim')
  await given('live after sim')

  o.end()
})
