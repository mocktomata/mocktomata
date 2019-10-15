import { AssertOrder } from 'assertron';
import { incubator } from '.';

// beforeAll(async () => {
//   const harness = k.createTestHarness()
//   await harness.io.writeSpec('only simulate: simulate', { refs: [], actions: [] })
// })

test('KOMONDOR_TEST_MODE=simulate will only run the simulate test', async () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'simulate'
  incubator.trio('only simulate', (title) => {
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
  incubator.trio('only save', (title) => {
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
  incubator.trio('only live', (title) => {
    o.once(1)
    actual = title
  })

  await o.end(100)
  expect(actual).toBe(`only live: live`)
})
