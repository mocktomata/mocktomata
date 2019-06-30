import { ScenarioNotFound, ScenarioRecord, SpecNotFound, SpecRecord } from '@komondor-lab/core';
import t from 'assert';
import a from 'assertron';
import { context } from './context';
import { createIO } from './createIO';
import { createFakeRepository } from './test-util';

beforeAll(async () => {
  context.get().repository = createFakeRepository()
})

test('read not exist spec throws SpecNotFound', async () => {
  const io = createIO()

  await a.throws(io.readSpec('not exist'), SpecNotFound)
})

test('read existing spec', async () => {
  const io = createIO()

  const actual = await io.readSpec('exist')

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const io = createIO()

  const record: SpecRecord = { refs: [], actions: [{ type: 'instantiate', payload: [], ref: '1', tick: 0 }] }
  await io.writeSpec('new spec', record)

  const repo = context.get().repository
  const spec = await repo.readSpec('new spec')
  expect(spec).toEqual(JSON.stringify(record))
})

test('read not exist scenario throws ScenarioNotFound', async () => {
  const io = createIO()

  await a.throws(io.readScenario('not exist'), ScenarioNotFound)
})

test('read existing scenario', async () => {
  const io = createIO()

  const actual = await io.readScenario('exist')

  expect(actual).toEqual({ scenario: 'exist' })
})

test('write Scenario', async () => {
  const io = createIO()

  const record: ScenarioRecord = { actions: [{ name: 'construct', instanceId: 1, plugin: '', payload: [] }] }
  await io.writeScenario('new scenario', record)

  const repo = context.get().repository
  const scenario = await repo.readScenario('new scenario')
  expect(scenario).toEqual(JSON.stringify(record))
})

describe('getPluginList()', () => {
  test('returns installed plugin', async () => {
    const io = createIO()

    const list = await io.getPluginList()
    expect(list).toEqual(['@komondor-lab/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load npm plugin package', async () => {
    const io = createIO()
    const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-dummy')

    t.strictEqual(typeof actual.activate, 'function')
  })

  test('can load plugin using deep link', async () => {
    const io = createIO()
    const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-deep-link/pluginA')

    t.strictEqual(typeof actual.activate, 'function')
  })
})
