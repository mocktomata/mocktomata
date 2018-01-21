import { satisfy, AssertOrder } from 'assertron'
import { test } from 'ava'

import { createSpecStore } from './specStore'

test('add action', t => {
  const store = createSpecStore()
  store.add({
    type: 'invoke',
    payload: []
  })
  t.is(store.actions.length, 1)
})

test('load not exist file', async t => {
  const store = createSpecStore()
  await store.load('specStore/notExist')
  t.is(store.actions.length, 0)
})

test('save then load', async t => {
  const store = createSpecStore()
  store.add({ type: 'invoke', payload: [] })
  store.expectation = `[{ type: 'invoke' }]`
  await store.save('specStore/save')

  const loadStore = createSpecStore()
  await loadStore.load('specStore/save')

  t.is(loadStore.expectation, store.expectation)
  t.is(loadStore.actions.length, 1)
})
test('peek with no action returns undefined', t => {
  const store = createSpecStore()

  t.is(store.peek(), undefined)
})

test('peek with actions returns first action', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')

  satisfy(store.peek(), { type: 'action1' })
})

test('next with no action returns undefined', t => {
  const store = createSpecStore()

  t.is(store.next(), undefined)
})

test('next gets next action', async t => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  const a1 = store.next()
  const a2 = store.next()
  const a3 = store.next()

  satisfy(a1, { type: 'action1', payload: [] })
  satisfy(a2, { type: 'action2', payload: [] })
  t.is(a3, undefined)
})
test('prune with no action ends with no action', t => {
  const store = createSpecStore()
  store.prune()

  t.is(store.actions.length, 0)
})

test('prune without move clears all actions', async t => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.prune()

  t.is(store.actions.length, 0)
})

test('prune clears remaining actions', async t => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.next()
  store.prune()

  t.is(store.actions.length, 1)
})

test('graft will append on empty actions', t => {
  const store = createSpecStore()
  store.graft({ type: 'a1', payload: [] })
  t.is(store.actions.length, 1)
})

test('graft will replace actions after current action', async t => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.next()

  store.graft({ type: 'a1', payload: [] })

  t.is(store.actions.length, 2)
  satisfy(store.actions[0], { type: 'action1' })
  satisfy(store.actions[1], { type: 'a1' })
})

test('on() will not trigger if not adding the specific action type', t => {
  const store = createSpecStore()
  store.on('action1', t.fail)
  store.add({ type: 'something', payload: [] })
})

test('on() will trigger when the right action is added', () => {
  const store = createSpecStore()
  const order = new AssertOrder(1)
  store.on('action1', () => order.once(1))
  store.add({ type: 'action1', payload: [] })

  order.end()
})

test('onAny() will trigger when any aciton is added', () => {
  const store = createSpecStore()
  const order = new AssertOrder(2)
  store.onAny(() => order.any([1, 2]))
  store.add({ type: 'a1', payload: undefined })
  store.add({ type: 'a2', payload: undefined })

  order.end()
})
