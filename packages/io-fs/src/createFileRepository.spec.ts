import fs from 'fs'
import path from 'path'
import { dirSync } from 'tmp'
import { createFileRepository } from '.'

test('load npm plugin package', async () => {
  const io = createFileRepository('fixtures/has-plugins')
  const actual = await io.loadPlugin('@mocktomata/plugin-fixture-dummy')
  expect(typeof actual.activate).toBe('function')
})

test('can load plugin using deep link', async () => {
  const io = createFileRepository('fixtures/has-plugins')
  const actual = await io.loadPlugin('@mocktomata/plugin-fixture-deep-link/pluginA')

  expect(typeof actual.activate).toBe('function')
})

test('can specify folder using options', async () => {
  const tmpdir = dirSync()
  const cwd = tmpdir.name

  const io = createFileRepository(cwd, { folder: '.mocko' })

  await io.writeSpec('spec x', 'src/dummy.spec.ts', 'dummy')

  expect(fs.existsSync(path.join(cwd, '.mocko'))).toBe(true)
})

test('can specify plugins through options', async () => {
  const tmpdir = dirSync()
  const cwd = tmpdir.name

  const io = createFileRepository(cwd, { plugins: ['dummy'] })

  const actual = await io.getPluginList()
  expect(actual).toEqual(['dummy'])
})
