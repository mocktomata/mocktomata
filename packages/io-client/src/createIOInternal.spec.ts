import { ScenarioNotFound, ScenarioRecord, SpecNotFound, SpecRecord } from '@komondor-lab/core';
import a from 'assertron';
import { createIOInternal } from './createIOInternal';
import { createFakeServerFetch } from './test-util';


test('read not exist spec throws SpecNotFound', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  await a.throws(io.readSpec('not exist'), SpecNotFound)
})

test('read existing spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const actual = await io.readSpec('exist')

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const record: SpecRecord = { refs: [], actions: [{ type: 'instantiate', payload: [], ref: '1', tick: 0 }] }
  await io.writeSpec('new spec', record)

  const spec = fetch.specs['new spec']
  expect(spec).toEqual(record)
})

test('read not exist scenario throws ScenarioNotFound', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  await a.throws(io.readScenario('not exist'), ScenarioNotFound)
})

test('read existing scenario', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const actual = await io.readScenario('exist')

  expect(actual).toEqual({ scenario: 'exist' })
})

test('write Scenario', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const record: ScenarioRecord = { actions: [{ name: 'construct', instanceId: 1, plugin: '', payload: [] }] }
  await io.writeScenario('new scenario', record)

  const spec = fetch.scenarios['new scenario']
  expect(spec).toEqual(record)
})

describe('getPluginList()', () => {
  test('returns installed plugin', async () => {
    const fetch = createFakeServerFetch()
    const io = await createIOInternal({ fetch, location })

    const list = await io.getPluginList()
    expect(list).toEqual(['@komondor-lab/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load existing plugin', async () => {
    const fetch = createFakeServerFetch()
    const io = await createIOInternal({ fetch, location })

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
