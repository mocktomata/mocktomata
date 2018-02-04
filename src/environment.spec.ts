import { AssertOrder } from 'assertron'
import { test } from 'ava'

import { onEnvironment, environment } from './environment'
import { MissingClauseHandler } from './errors'

test('no handler registered throws MissingClauseHandler', async t => {
  await t.throws(environment('no handler'), MissingClauseHandler)
})

test('handler will be invoked', async () => {
  const order = new AssertOrder(1)
  onEnvironment('invoking handler', () => order.once(1))

  await environment('invoking handler')

  order.end()
})

test('handler can be registered using regex', async () => {
  const order = new AssertOrder(1)
  onEnvironment(/reg using reg/, () => order.once(1))

  await environment('reg using regex')

  order.end()
})

test('using environment twice will only invoke handler once', async () => {
  const order = new AssertOrder(1)
  onEnvironment('invoke once', () => order.once(1))

  await environment('invoke once')
  await environment('invoke once')

  order.end()
})

test('receives environment context from the handler', async t => {
  onEnvironment('returning context', () => ({ a: 1 }))

  const actual = await environment<{ a: number }>('returning context')
  t.deepEqual(actual, { a: 1 })
})

test('receives async environment context from the handler', async t => {
  onEnvironment('returning context', () => Promise.resolve({ a: 1 }))

  const actual = await environment<{ a: number }>('returning context')
  t.deepEqual(actual, { a: 1 })
})


test('invoke listener after handler', async t => {
  const order = new AssertOrder(2)
  onEnvironment('invoke listener', () => order.once(1))

  await environment('invoke listener', () => order.once(2))

  order.end()
})

test('receive context from listener', async t => {
  onEnvironment('returning listener context', () => ({ a: 1 }))

  const actual = await environment('returning listener context', () => ({ b: 2 }))
  t.deepEqual(actual, { a: 1, b: 2 })
})


test('receive async context from listener', async t => {
  onEnvironment('returning async listener context', () => ({ a: 1 }))

  const actual = await environment<{ a: number } & { b: number }>('returning async listener context', () => Promise.resolve({ b: 2 }))
  t.deepEqual(actual, { a: 1, b: 2 })
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

test('simulate model calls listener with EnvironmentContext', async t => {
  const o = new AssertOrder(2)
  onEnvironment('simulate mode', ({ mode }) => {
    o.once(1)
    t.is(mode, 'simulate')
  })

  await environment.simulate('simulate mode', ({ mode }) => {
    o.once(2)
    t.is(mode, 'simulate')
  })
  o.end()
})

test('calling environment within simulated environment will simulate', async t => {
  const o = new AssertOrder(5)
  onEnvironment('simulate calling env', ({ mode, environment }) => {
    o.once(1)
    t.is(mode, 'simulate')
    return environment('should simulate for onEnvironment')
  })
  onEnvironment('should simulate for onEnvironment', ({ mode }) => {
    o.once(2)
    t.is(mode, 'simulate')
  })
  onEnvironment('should simulate', ({ mode }) => {
    o.once(4)
    t.is(mode, 'simulate')
  })

  await environment.simulate('simulate calling env', ({ mode, environment }) => {
    o.once(3)
    t.is(mode, 'simulate')
    return environment('should simulate', ({ mode }) => {
      o.once(5)
      t.is(mode, 'simulate')
    })
  })
  o.end()
})
