import { PluginModuleNotConforming, PluginNotFound } from '@mocktomata/framework'
import a from 'assertron'
import { captureLogs } from 'standard-log'
import { loadPlugin } from '.'
import { log } from '../log'
import { fixturePath } from '../util'

test('load simple plugin', () => {
  const cwd = fixturePath('has-plugins')
  const plugin = loadPlugin(cwd, '@mocktomata/plugin-fixture-dummy')
  expect(typeof plugin.activate).toBe('function')
})

test('load deep link plugin', () => {
  const cwd = fixturePath('has-plugins')
  const actual = loadPlugin(cwd, '@mocktomata/plugin-fixture-deep-link/pluginA')

  expect(typeof actual.activate).toBe('function')
})

test('load based on cwd', () => {
  const cwd = fixturePath('has-plugins')
  const actual = loadPlugin(cwd, 'm-plugin-dummy')
  expect(typeof actual.activate).toBe('function')
})

test('no activate property throws PluginModuleNotConforming', () => {
  const cwd = fixturePath('has-plugins')
  a.throws(() => loadPlugin(cwd, 'no-activate'), PluginModuleNotConforming)
})

test('activate property not a function throws PluginModuleNotConforming', () => {
  const cwd = fixturePath('has-plugins')
  a.throws(() => loadPlugin(cwd, 'activate-not-fn'), PluginModuleNotConforming)
})

test('not a package', () => {
  const logs = captureLogs(log, () => {
    const cwd = fixturePath('has-plugins')
    a.throws(() => loadPlugin(cwd, 'not-exist'), PluginNotFound)
  })

  a.satisfies(logs, [{ args: ['Unable to find plugin: not-exist'] }])
})
