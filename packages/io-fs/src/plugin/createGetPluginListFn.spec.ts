import { dirSync } from 'tmp';
import { createFileIO } from '..';
import { resetStore } from '../store';

beforeEach(() => {
  resetStore()
})

test('gets empty plugin list in empty folder', async () => {
  const tmpdir = dirSync()
  const cwd = tmpdir.name

  const io = createFileIO(cwd)
  expect(await io.getPluginList()).toEqual([])
})

test('get both installed plugins when there is no config', async () => {
  const cwd = 'fixtures/has-plugins'

  const io = createFileIO(cwd)
  expect(await io.getPluginList()).toEqual([
    '@komondor-lab/plugin-fixture-deep-link',
    '@komondor-lab/plugin-fixture-dummy'
  ])
})

test('get configured plugin list', async () => {
  const cwd = 'fixtures/has-config'

  const io = createFileIO(cwd)

  expect(await io.getPluginList()).toEqual(['@komondor-lab/plugin-fixture-dummy'])
})
