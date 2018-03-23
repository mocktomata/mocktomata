import t from 'assert'
import { satisfy, AssertOrder } from 'assertron'

import { createSpecStore } from './specStore'

test('add action', () => {
  const store = createSpecStore()
  store.add({
    type: 'invoke',
    payload: [],
    meta: {}
  })
  t.equal(store.actions.length, 1)
})

test('load not exist file', async () => {
  const store = createSpecStore()
  await store.load('specStore/notExist')
  t.equal(store.actions.length, 0)
})

test('save then load', async () => {
  const store = createSpecStore()
  store.add({ type: 'invoke', payload: [], meta: {} })
  store.expectation = `[{ type: 'invoke' }]`
  await store.save('specStore/save')

  const loadStore = createSpecStore()
  await loadStore.load('specStore/save')

  t.equal(loadStore.expectation, store.expectation)
  t.equal(loadStore.actions.length, 1)
})
test('peek with no action returns undefined', () => {
  const store = createSpecStore()

  t.equal(store.peek(), undefined)
})

test('peek with actions returns first action', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')

  satisfy(store.peek()!, { type: 'action1' })
})

test('next with no action returns undefined', () => {
  const store = createSpecStore()

  t.equal(store.next(), undefined)
})

test('next moves to next action and peek gets it', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  const a1 = store.peek()!
  store.next()
  const a2 = store.peek()!
  store.next()
  const a3 = store.peek()

  satisfy(a1, { type: 'action1', payload: [] })
  satisfy(a2, { type: 'action2', payload: [] })
  t.equal(a3, undefined)
})

test('prune with no action ends with no action', () => {
  const store = createSpecStore()
  store.prune()

  t.equal(store.actions.length, 0)
})

test('prune without move clears all actions', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.prune()

  t.equal(store.actions.length, 0)
})

test('prune clears remaining actions', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.next()
  store.prune()

  t.equal(store.actions.length, 1)
})

test('graft will append on empty actions', () => {
  const store = createSpecStore()
  store.graft({ type: 'a1', payload: [], meta: {} })
  t.equal(store.actions.length, 1)
})

test('graft will replace actions after current action', async () => {
  const store = createSpecStore()
  await store.load('specStore/twoActions')
  store.next()

  store.graft({ type: 'a1', payload: [], meta: {} })

  t.equal(store.actions.length, 2)
  satisfy(store.actions[0], { type: 'action1' })
  satisfy(store.actions[1], { type: 'a1' })
})

test('on() will not trigger if not adding the specific action type', () => {
  const store = createSpecStore()
  store.on('action1', t.fail)
  store.add({ type: 'something', payload: [], meta: {} })
})

test('on() will trigger when the right action is added', () => {
  const store = createSpecStore()
  const order = new AssertOrder(1)
  store.on('action1', () => order.once(1))
  store.add({ type: 'action1', payload: [], meta: {} })

  order.end()
})

test('onAny() will trigger when any aciton is added', () => {
  const store = createSpecStore()
  const order = new AssertOrder(2)
  store.onAny(() => order.any([1, 2]))
  store.add({ type: 'a1', payload: undefined, meta: {} })
  store.add({ type: 'a2', payload: undefined, meta: {} })

  order.end()
})
