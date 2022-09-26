import { PluginNotFound } from '@mocktomata/framework'
import a from 'assertron'
import { createStandardLogForTest } from 'standard-log'
import { fixturePath } from '../util/index.js'
import { loadPlugin } from './index.js'
import { ctx } from './loadPlugin.js'

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

test('not a package', () => {
  const sl = createStandardLogForTest()
  ctx.log = sl.getLogger('mocktomata')
  const cwd = fixturePath('has-plugins')
  a.throws(() => loadPlugin(cwd, 'not-exist'), PluginNotFound)

  a.satisfies(sl.reporter.logs, [{ args: ['Unable to find plugin: not-exist'] }])
})
