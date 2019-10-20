import { SpecNotFound, SpecRecord } from '@mocktomata/framework';
import t from 'assert';
import a from 'assertron';
import { context } from './context';
import { createIO } from './createIO';
import { createFakeRepository } from './test-util';

beforeAll(async () => {
  context.value.repository = createFakeRepository()
})

test('read not exist spec throws SpecNotFound', async () => {
  const io = createIO()

  await a.throws(io.readSpec('not exist', ''), SpecNotFound)
})

test('read existing spec', async () => {
  const io = createIO()

  const actual = await io.readSpec('exist', '')

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const io = createIO()

  const record: SpecRecord = { refs: [], actions: [] }
  await io.writeSpec('new spec', __filename, record)

  const repo = context.value.repository
  const spec = await repo.readSpec('new spec', __filename)
  expect(spec).toEqual(JSON.stringify(record))
})

describe('getPluginList()', () => {
  test('returns installed plugin', async () => {
    const io = createIO()

    const list = await io.getPluginList()
    expect(list).toEqual(['@mocktomata/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load npm plugin package', async () => {
    const io = createIO()
    const actual = await io.loadPlugin('@mocktomata/plugin-fixture-dummy')

    t.strictEqual(typeof actual.activate, 'function')
  })

  test('can load plugin using deep link', async () => {
    const io = createIO()
    const actual = await io.loadPlugin('@mocktomata/plugin-fixture-deep-link/pluginA')

    t.strictEqual(typeof actual.activate, 'function')
  })
})
