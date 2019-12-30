import { SpecNotFound, SpecRecord } from '@mocktomata/framework';
import a from 'assertron';
import { createIOInternal } from './createIOInternal';
import { createFakeServerFetch } from './test-util';

test('read not exist spec throws SpecNotFound', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  await a.throws(io.readSpec('not exist', __filename), SpecNotFound)
})

test('read existing spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const actual = await io.readSpec('exist', __filename)

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location })

  const record: SpecRecord = { refs: [], actions: [{ type: 'invoke', refId: '1', performer: 'user', thisArg: '0', payload: [], tick: 0 }] }
  await io.writeSpec('new spec', __filename, record)

  const spec = fetch.specs['new spec']
  expect(spec).toEqual(record)
})

describe('getPluginList()', () => {
  test('returns installed plugin', async () => {
    const fetch = createFakeServerFetch()
    const io = await createIOInternal({ fetch, location })

    const list = await io.getPluginList()
    expect(list).toEqual(['@mocktomata/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load existing plugin', async () => {
    const fetch = createFakeServerFetch()
    const io = await createIOInternal({ fetch, location })

    const p = await io.loadPlugin(`@mocktomata/plugin-fixture-dummy`)

    expect(typeof p.activate).toBe('function')
  })
})

// describe('loadConfig()', () => {
//   test('load...', async () => {
//     const io = await createClientIO()
//     await io.loadConfig()
//   })
// })
