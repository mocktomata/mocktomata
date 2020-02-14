import { dirSync } from 'tmp'
import { createPluginRepository } from '..'
import { fixturePath } from '../util'

test('gets empty plugin list in empty folder', async () => {
  const tmpdir = dirSync()
  const cwd = tmpdir.name

  const io = createPluginRepository({ cwd })
  expect(await io.findInstalledPlugins()).toEqual([])
})

test('find all installed plugins', async () => {
  const cwd = fixturePath('has-plugins')

  const io = createPluginRepository({ cwd })
  expect(await io.findInstalledPlugins()).toEqual([
    '@mocktomata/plugin-fixture-deep-link',
    '@mocktomata/plugin-fixture-dummy'
  ])
})

test('load simple plugin', async () => {
  const cwd = fixturePath('has-plugins')
  const io = createPluginRepository({ cwd })
  const plugin = await io.loadPlugin('@mocktomata/plugin-fixture-dummy')
  expect(typeof plugin.activate).toBe('function')
})

test('load deep link plugin', async () => {
  const cwd = fixturePath('has-plugins')
  const io = createPluginRepository({ cwd })
  const actual = await io.loadPlugin('@mocktomata/plugin-fixture-deep-link/pluginA')

  expect(typeof actual.activate).toBe('function')
})
