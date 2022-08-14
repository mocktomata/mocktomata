import { SpecNotFound, SpecRecord } from '@mocktomata/framework'
import t from 'assert'
import a from 'assertron'
import path from 'path'
import { dirSync } from 'tmp'
import { createIO } from './index.js'

test('get spec config', async () => {
  const cwd = fixturePath('simple')
  const io = createIO({ cwd })

  const config = await io.getConfig()
  expect(config).toEqual({
    overrideMode: 'live',
    filePathFilter: 'file',
    specNameFilter: 'spec',
    plugins: ['@mocktomata/plugin-fixture-dummy']
  })
})

test('read not exist spec throws SpecNotFound', async () => {
  const io = createIO()

  await a.throws(io.readSpec('not exist', __dirname), SpecNotFound)
})

test('read existing spec', async () => {
  const cwd = fixturePath('simple')
  const io = createIO({ cwd })
  const invokePath = path.join(cwd, 'src/createIO.spec.ts')

  const actual = await io.readSpec('exist', invokePath)

  expect(actual).toEqual({ refs: [], actions: [] })
})

test('write spec', async () => {
  const cwd = dirSync().name
  const io = createIO({ cwd })
  const invokePath = path.join(cwd, 'src/createIO.spec.ts')
  const record: SpecRecord = { refs: [], actions: [] }
  await io.writeSpec('new spec', invokePath, record)

  const spec = await io.readSpec('new spec', invokePath)
  expect(spec).toEqual({ refs: [], actions: [] })
})

describe('getConfig()', () => {
  test('returns installed plugin', async () => {
    const cwd = fixturePath('simple')
    const io = createIO({ cwd })

    const list = await (await io.getConfig()).plugins
    expect(list).toEqual(['@mocktomata/plugin-fixture-dummy'])
  })
})

describe('loadPlugin()', () => {
  test('load npm plugin package', async () => {
    const cwd = fixturePath('simple')
    const io = createIO({ cwd })
    const actual = await io.loadPlugin('@mocktomata/plugin-fixture-dummy')

    t.strictEqual(typeof actual.activate, 'function')
  })

  test('can load plugin using deep link', async () => {
    const cwd = fixturePath('simple')
    const io = createIO({ cwd })
    const actual = await io.loadPlugin('@mocktomata/plugin-fixture-deep-link/pluginA')

    t.strictEqual(typeof actual.activate, 'function')
  })
})

export function fixturePath(dir: string) {
  return path.join(__dirname, `../fixtures/${dir}`)
}
