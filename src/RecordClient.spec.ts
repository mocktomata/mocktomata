import t from 'assert'
import a from 'assertron'

import { RecordClient } from './RecordClient'
import { SpecNotFound, ScenarioNotFound } from '.';

// since it is process based, all test must use th same location.
const client = new RecordClient()

const dir = 'fixtures/record-client'
client.startService(dir)

test('not exist spec will throw SpecNotFound', async () => {
  const err = await a.throws(client.getSpec('not exist'))
  t(err instanceof SpecNotFound)
})

test('not exist spec will throw SpecNotFound', async () => {
  const err = await a.throws(client.getScenario('not exist'))
  t(err instanceof ScenarioNotFound)
})


test('set spec', async () => {
  await client.setSpec('recorded spec', {
    expectation: '[]',
    actions: []
  })
})

test('set scenario', async () => {
  await client.setScenario('recorded scenario', {
    setups: [],
    runs: [],
    teardowns: [],
    specs: {}
  })
})

test('get spec', async () => {
  const actual = await client.getSpec('recorded spec')
  t.deepEqual(actual, {
    expectation: '[]',
    actions: []
  })
})

test('set scenario', async () => {
  const actual = await client.getScenario('recorded scenario')
  t.deepEqual(actual, {
    setups: [],
    runs: [],
    teardowns: [],
    specs: {}
  })
})
