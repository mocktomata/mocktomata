import { AssertOrder } from 'assertron'
import { test } from 'ava'

import { onEnvironment, environment } from './environment'
import { MissingEnvironmentHandler, DuplicateEnvironmentHandler } from './errors'

test('no handler registered throws MissingEnvironmentHandler', async t => {
  await t.throws(environment('no handler'), MissingEnvironmentHandler)
})

test('handler will be invoked', async () => {
  const order = new AssertOrder(1)
  onEnvironment('invoking handler', () => order.once(1))

  await environment('invoking handler')

  order.end()
})

test('duplicate handler will throws', async t => {
  onEnvironment('dup handler', () => { return })
  await t.throws(() => onEnvironment('dup handler', () => { return }), DuplicateEnvironmentHandler)
})

test('handler can be registered using regex', async () => {
  const order = new AssertOrder(1)
  onEnvironment(/reg using reg/, () => order.once(1))

  await environment('reg using regex')

  order.end()
})

test('duplicate regex handler will throws', async t => {
  onEnvironment(/dup regex handler/, () => { return })
  await t.throws(() => onEnvironment(/dup regex handler/, () => { return }), DuplicateEnvironmentHandler)
})

test('using environment twice will only invoke handler once', async () => {
  const order = new AssertOrder(1)
  onEnvironment('invoke once', () => order.once(1))

  await environment('invoke once')

  // in another test
  await environment('invoke once')

  order.end()
})

test('resulting env.fixture contains information provided by the handler', async t => {
  onEnvironment('returning context', () => ({ a: 1 }))

  const actual = await environment<{ a: number }>('returning context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('receives async environment context from the handler', async t => {
  onEnvironment('returning async context', () => Promise.resolve({ a: 1 }))

  const actual = await environment<{ a: number }>('returning async context')
  t.deepEqual(actual.fixture, { a: 1 })
})

test('with localHandler, MissingEnvironmentHandler will not be thrown', () => {
  return environment('no throw with listener', () => { return })
})

test('define localHandler while already has a handler throws DupHandler error', async t => {
  onEnvironment('invoke localHandler', () => t.fail('should not reach'))

  await t.throws(environment('invoke localHandler', () => { return }), DuplicateEnvironmentHandler)
})

test('receive context from localHandler', async t => {
  const actual = await environment('returning localHandler context', () => ({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})


test('receive async context from localHandler', async t => {
  const actual = await environment<{ a: number } & { b: number }>(
    'returning async localHandler context',
    () => Promise.resolve({ b: 2 }))
  t.deepEqual(actual.fixture, { b: 2 })
})

test('simulate model calls handler with EnvironmentContext', async t => {
  const o = new AssertOrder(1)
  onEnvironment('simulate mode', ({ mode }) => {
    o.once(1)
    t.is(mode, 'simulate')
  })

  await environment.simulate('simulate mode')
  o.end()
})

test('simulate model calls local handler with EnvironmentContext', async t => {
  const o = new AssertOrder(1)

  await environment.simulate('simulate mode with local handler', ({ mode }) => {
    o.once(1)
    t.is(mode, 'simulate')
  })
  o.end()
})

test('simulating environment will force spec to simulate', async t => {
  function success(_a, _cb) {
    // callback(null, a + 1)
    t.fail('should not reach')
  }
  onEnvironment('simulate calling env', async ({ mode, spec }) => {
    t.is(mode, 'simulate')
    const cbSpec = await spec('environment/simulate/spec', success)
    cbSpec.subject(2, (_, a) => t.is(a, 3))

    return cbSpec.satisfy([undefined, { payload: [undefined, 3] }])
  })

  await environment.simulate('simulate calling env')
})

test('simulating environment will force spec in localHandler to simulate', async t => {
  function success(_a, _cb) {
    // callback(null, a + 1)
    t.fail('should not reach')
  }

  await environment.simulate('simulate calling env with localHandler', async ({ mode, spec }) => {
    t.is(mode, 'simulate')
    const cbSpec = await spec('environment/simulate/spec', success)
    cbSpec.subject(2, (_, a) => t.is(a, 3))

    return cbSpec.satisfy([undefined, { payload: [undefined, 3] }])
  })
})

test('environment context contains spec', async t => {
  onEnvironment('context has spec', ({ spec }) => t.truthy(spec))
  await environment('local context has spec', ({ spec }) => t.truthy(spec))
})

test('simulate environment context contains spec', async t => {
  onEnvironment('simulate context has spec', ({ spec }) => t.truthy(spec))
  await environment.simulate('simulate local context has spec', ({ spec }) => t.truthy(spec))
})
