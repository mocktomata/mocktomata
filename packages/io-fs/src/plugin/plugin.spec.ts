import path from 'path';
import { dirSync } from 'tmp';
import { createFileRepository } from '..';

test('gets empty plugin list in empty folder', async () => {
  const tmpdir = dirSync()
  const cwd = tmpdir.name

  const io = createFileRepository(cwd)
  expect(await io.getPluginList()).toEqual([])
})

test('get both installed plugins when there is no config', async () => {
  const cwd = path.resolve(__dirname, '../../fixtures/has-plugins')

  const io = createFileRepository(cwd)
  expect(await io.getPluginList()).toEqual([
    '@mocktomata/plugin-fixture-deep-link',
    '@mocktomata/plugin-fixture-dummy'
  ])
})

test('get configured plugin list', async () => {
  const cwd = path.resolve(__dirname, '../../fixtures/has-config')

  const io = createFileRepository(cwd)

  expect(await io.getPluginList()).toEqual(['@mocktomata/plugin-fixture-dummy'])
})
