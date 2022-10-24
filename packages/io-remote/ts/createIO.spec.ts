import { SpecNotFound, SpecRecord } from '@mocktomata/framework'
import { a } from 'assertron'
import { createIOInternal } from './createIO.internal.js'
import { createFakeServerFetch } from './test-util/index.js'

const location = {
  hostname: 'localhost',
  protocol: 'http:'
}

test('read not exist spec throws SpecNotFound', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location, importModule: () => Promise.resolve({}) })

  await a.throws(io.readSpec('not exist', 'some-path/file'), SpecNotFound)
})

test('read existing spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location, importModule: () => Promise.resolve({}) })

  const actual = await io.readSpec('exist', 'some-path/file')

  expect(actual).toEqual({ actions: [] })
})

test('write spec', async () => {
  const fetch = createFakeServerFetch()
  const io = await createIOInternal({ fetch, location, importModule: () => Promise.resolve({}) })

  const record: SpecRecord = { refs: [], actions: [{ type: 'invoke', refId: '1', performer: 'user', thisArg: '0', payload: [], tick: 0 }] }
  await io.writeSpec('new spec', 'some-path/file', record)

  const spec = fetch.specs['new spec']
  expect(spec).toEqual(record)
})

describe('loadConfig()', () => {
  test('returns installed plugin', async () => {
    const fetch = createFakeServerFetch()
    const io = await createIOInternal({ fetch, location, importModule: () => Promise.resolve({}) })

    const list = await (await io.loadConfig()).plugins
    expect(list).toEqual(['@mocktomata/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load existing plugin', async () => {
    const fetch = createFakeServerFetch()
    const dummy = { activate() { } }
    const io = await createIOInternal({
      fetch, location, importModule: (
        moduleSpecifier
      ) => Promise.resolve(moduleSpecifier
        ? dummy : undefined)
    })

    const p = await io.loadPlugin(`@mocktomata/plugin-fixture-dummy`)

    expect(p).toBe(dummy)
  })
})

// describe('loadConfig()', () => {
//   test('load...', async () => {
//     const io = await createClientIO()
//     await io.loadConfig()
//   })
// })
