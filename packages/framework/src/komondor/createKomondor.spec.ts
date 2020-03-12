// import a from 'assertron'
// import { captureLogs, logLevels } from 'standard-log'
// import { createMockto, SpecNotFound } from '..'
// import { log } from '../log'
import { logLevels, captureLogs } from 'standard-log'
import { createTestContext } from '../test-utils'
import { createKomondor } from './createKomondor'
import { log } from '../log'

const context = createTestContext()
const k = createKomondor(context)

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

test('save has enableLog method', async () => {
  const spec = k.save('save has enableLog method')
  await spec(() => { })
  const logs = await captureLogs(log, async () => {
    spec.enableLog()
    await spec.done()
  })

  expect(logs.length).toBe(1)
})

test('save enableLog method can specify log level', async () => {
  const spec = k.save('save enableLog method can specify log level')
  await spec(() => { })
  spec.enableLog(logLevels.none)
  await spec.done()
})
