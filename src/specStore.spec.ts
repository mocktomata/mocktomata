import t from 'assert'
import { satisfy, AssertOrder } from 'assertron'

import { createSpecStore } from './specStore'

test('add action', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  store.add('invoke')
  t.equal(store.actions.length, 1)
})

test('load not exist file', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  await store.load('specStore/notExist')
  t.equal(store.actions.length, 0)
})

test('save then load', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  store.add('invoke')
  store.expectation = `[{ type: 'invoke' }]`
  await store.save('specStore/save')

  const loadStore = await createSpecStore('some', undefined, 'live')
  await loadStore.load('specStore/save')

  t.equal(loadStore.expectation, store.expectation)
  t.equal(loadStore.actions.length, 1)
})
test('peek with no action returns undefined', async () => {
  const store = await createSpecStore('some', undefined, 'live')

  t.equal(store.peek(), undefined)
})

test('peek with actions returns first action', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  await store.load('specStore/twoActions')

  satisfy(store.peek(), { type: 'action1' })
})

test('next with no action returns undefined', async () => {
  const store = await createSpecStore('some', undefined, 'live')

  t.equal(store.next(), undefined)
})

test('next moves to next action and peek gets it', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  await store.load('specStore/twoActions')
  const a1 = store.peek()
  store.next()
  const a2 = store.peek()
  store.next()
  const a3 = store.peek()

  satisfy(a1, { type: 'action1', payload: [] })
  satisfy(a2, { type: 'action2', payload: [] })
  t.equal(a3, undefined)
})

test('prune with no action ends with no action', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  store.prune()

  t.equal(store.actions.length, 0)
})

test('prune without move clears all actions', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  await store.load('specStore/twoActions')
  store.prune()

  t.equal(store.actions.length, 0)
})

test('prune clears remaining actions', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  await store.load('specStore/twoActions')
  store.next()
  store.prune()

  t.equal(store.actions.length, 1)
})


test('on() will not trigger if not adding the specific action type', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  store.on('action1', t.fail)
  store.add('something')
})

test('on() will trigger when the right action is added', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  const order = new AssertOrder(1)
  store.on('action1', () => order.once(1))
  store.add('action1')

  order.end()
})

test('onAny() will trigger when any aciton is added', async () => {
  const store = await createSpecStore('some', undefined, 'live')
  const order = new AssertOrder(2)
  store.onAny(() => order.any([1, 2]))
  store.add('a1')
  store.add('a2')

  order.end()
})
