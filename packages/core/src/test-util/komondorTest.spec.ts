import { AssertOrder } from 'assertron'
import { komondorTest } from '..';

test('KOMONDOR_TEST_MODE=simulate will only run the simulate test', () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'simulate'
  komondorTest.trio('only simulate', (title) => {
    o.once(1)
    actual = title
  })

  expect(actual).toBe(`only simulate: simulate`)
})

test('KOMONDOR_TEST_MODE=save will only run the save test', () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'save'
  komondorTest.trio('only save', (title) => {
    o.once(1)
    actual = title
  })

  expect(actual).toBe(`only save: save`)
})

test('KOMONDOR_TEST_MODE=live will only run the live test', () => {
  const o = new AssertOrder(1)
  let actual = ''
  process.env.KOMONDOR_TEST_MODE = 'live'
  komondorTest.trio('only live', (title) => {
    o.once(1)
    actual = title
  })

  expect(actual).toBe(`only live: live`)
})
