import { SpecNotFound, SpecRecord } from '@mocktomata/framework'
import t from 'assert'
import a from 'assertron'
import path from 'path'
import { dirSync } from 'tmp'
import { createIO } from '.'
import { gitRootDir } from './test-util'

test('read not exist spec throws SpecNotFound', async () => {
  const io = createIO()

  await a.throws(io.readSpec('not exist', __filename), SpecNotFound)
})

test('read existing spec', async () => {
  const rootDir = gitRootDir(process.cwd())!
  const cwd = path.join(rootDir, 'fixtures/io-local/with-spec')
  const io = createIO({ cwd })

  const specRelativePath = path.relative(rootDir, __filename)
  const actual = await io.readSpec('exist', specRelativePath)

  expect(actual).toEqual({ refs: [], actions: [] })
})

test('write spec', async () => {
  const tmp = dirSync()
  const io = createIO({ cwd: tmp.name })

  const record: SpecRecord = { refs: [], actions: [] }
  const specRelativePath = path.relative(process.cwd(), __filename)
  await io.writeSpec('new spec', specRelativePath, record)

  const spec = await io.readSpec('new spec', specRelativePath)
  expect(spec).toEqual({ refs: [], actions: [] })
})

describe('getPluginList()', () => {
  test('returns installed plugin', async () => {
    const io = createIO({ cwd: path.join(gitRootDir(process.cwd())!, 'fixtures/io-local/with-plugin') })

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
