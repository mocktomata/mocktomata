import { AssertOrder } from 'assertron';
import k from '.';

// beforeAll(async () => {
//   const harness = k.createTestHarness()
//   await harness.io.writeSpec('only simulate: simulate', { refs: [], actions: [] })
// })

test('KOMONDOR_TEST_MODE=simulate will only run the simulate test', async () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'simulate'
  k.trio('only simulate', (title) => {
    o.once(1)
    actual = title
  })

  await o.end(100)
  expect(actual).toBe(`only simulate: simulate`)
})

test('KOMONDOR_TEST_MODE=save will only run the save test', async () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'save'
  k.trio('only save', (title) => {
    o.once(1)
    actual = title
  })

  await o.end(100)
  expect(actual).toBe(`only save: save`)
})

test('KOMONDOR_TEST_MODE=live will only run the live test', async () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'live'
  k.trio('only live', (title) => {
    o.once(1)
    actual = title
  })

  await o.end(100)
  expect(actual).toBe(`only live: live`)
})
