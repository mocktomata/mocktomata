import { logLevels } from 'standard-log'
import { createTestContext } from '../test-utils/index.js'
import { createKomondor } from './createKomondor.js'

const { context } = createTestContext()
const k = createKomondor(context)

afterAll(() => k.teardown())

test('live with no options', async () => {
  const spec = k.live('live with no options')
  const s = await spec((x: number) => x + 1)
  expect(s(1)).toBe(2)
  await spec.done()
})

test('live with options', async () => {
  const spec = k.live('live with options', { timeout: 2000 })
  const s = await spec((x: number) => x + 1)
  expect(s(1)).toBe(2)
  await spec.done()
})

test('live has enableLog method', async () => {
  const spec = k.live('live has enableLog method')
  await spec(() => { })
  spec.enableLog()
})

test('live enableLog method can specify log level', async () => {
  const spec = k.live('live enableLog method can specify log level')
  await spec(() => { })
  spec.enableLog(logLevels.none)
})


test('save with no options', async () => {
  const spec = k.save('save with no options')
  const s = await spec((x: number) => x + 1)
  expect(s(1)).toBe(2)
  await spec.done()
})

test('save with options', async () => {
  const spec = k.save('save with options', { timeout: 2000 })
  const s = await spec((x: number) => x + 1)
  expect(s(1)).toBe(2)
  await spec.done()
})

// TODO: uncomment and fix, adding `reporter` or `logs` to `spec`
// test.skip('save has enableLog method', async () => {
//   const spec = k.save('save has enableLog method')
//   await spec(() => { })
//   spec.enableLog()
//   await spec.done()

//   expect(reporter.logs.length).toBe(1)
// })

test('save enableLog method can specify log level', async () => {
  const spec = k.save('save enableLog method can specify log level')
  await spec(() => { })
  spec.enableLog(logLevels.none)
  await spec.done()
})

test('auto lifecycle', async () => {
  const save = k('auto lifecycle')
  await save({})
  expect(save.mode).toBe('save')
  await save.done()

  const simulate = k('auto lifecycle')
  await simulate({})
  expect(simulate.mode).toBe('simulate')
  await simulate.done()
})
