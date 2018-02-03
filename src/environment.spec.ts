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

test('return environment context from the handler', async t => {
  onEnvironment('returning context', () => ({ a: 1 }))

  const actual = await environment('returning context')
  t.deepEqual(actual, { a: 1 })
})
