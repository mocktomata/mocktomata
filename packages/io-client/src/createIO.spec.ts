import { SpecNotFound, SpecRecord, ScenarioNotFound, ScenarioRecord } from '@komondor-lab/core';
import { context, start } from '@komondor-lab/file-server';
import a from 'assertron';
import { PromiseValue } from 'type-plus';
import { createIO } from '.';
import { createFakeRepository } from './test-util';

let server: PromiseValue<ReturnType<typeof start>>
beforeAll(async () => {
  context.get().repository = createFakeRepository()
  server = await start()
})

afterAll(() => {
  return server.stop()
})

test('read not exist spec throws SpecNotFound', async () => {
  const io = await createIO()

  await a.throws(io.readSpec('not exist'), SpecNotFound)
})

test('read existing spec', async () => {
  const io = await createIO()

  const actual = await io.readSpec('exist')

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const io = await createIO()

  const record: SpecRecord = { actions: [{ name: 'construct', instanceId: 1, plugin: '', payload: [] }] }
  await io.writeSpec('new spec', record)

  const repo = context.get().repository
  const spec = await repo.readSpec('new spec')
  expect(spec).toEqual(JSON.stringify(record))
})

test('read not exist scenario throws ScenarioNotFound', async () => {
  const io = await createIO()

  await a.throws(io.readScenario('not exist'), ScenarioNotFound)
})

test('read existing scenario', async () => {
  const io = await createIO()

  const actual = await io.readScenario('exist')

  expect(actual).toEqual({ scenario: 'exist' })
})

test('write Scenario', async () => {
  const io = await createIO()

  const record: ScenarioRecord = { actions: [{ name: 'construct', instanceId: 1, plugin: '', payload: [] }] }
  await io.writeScenario('new scenario', record)

  const repo = context.get().repository
  const scenario = await repo.readScenario('new scenario')
  expect(scenario).toEqual(JSON.stringify(record))
})

describe('getPluginList()', () => {
  test('yes', async () => {
    const io = await createIO()

    const list = await io.getPluginList()
    expect(list).toEqual(['@komondor-lab/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load existing plugin', async () => {
    const io = await createIO()

    const p = await io.loadPlugin(`@komondor-lab/plugin-fixture-dummy`)

    expect(typeof p.activate).toBe('function')
  })
})

// describe('loadConfig()', () => {
//   test('load...', async () => {
//     const io = await createClientIO()
//     await io.loadConfig()
//   })
// })
