import a from 'assertron'
import { logLevels } from 'standard-log'
import { addPluginModule, DuplicatePlugin, PluginNotConforming } from '.'
import { log } from '../log'
import { store } from '../store'
import { echoPluginModule, missGetSpyPluginModule, missGetStubPluginModule, missSupportPluginModule, noActivatePluginModule, pluginModuleA } from '../test-artifacts'

beforeEach(() => {
  log.level = logLevels.none
  store.reset()
})

afterEach(() => {
  log.level = undefined
})

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', () => {
  addPluginModule('@mocktomata/plugin-fixture-dummy', echoPluginModule)
  addPluginModule('@mocktomata/plugin-fixture-deep-link/pluginA', pluginModuleA)

  const actual = store.value.plugins
  a.satisfies(actual.map(p => p.name), [
    '@mocktomata/plugin-fixture-deep-link/pluginA/plugin-a',
    '@mocktomata/plugin-fixture-dummy'
  ])
})

test('undefined plugin does nothing', () => {
  addPluginModule('not-exist', undefined as any)

  expect(store.value.plugins).toEqual([])
})

test('plugin without activate function is ignored', () => {
  addPluginModule('@mocktomata/no-activate', noActivatePluginModule as any)
  expect(store.value.plugins).toEqual([])
})

test('registering plugin with the same name throws DuplicatePlugin', () => {
  addPluginModule('@mocktomata/plugin-fixture-dummy', echoPluginModule)
  a.throws(() => addPluginModule('@mocktomata/plugin-fixture-dummy', echoPluginModule), DuplicatePlugin)
})

test('plugin missing support method throws', () => {
  a.throws(() => addPluginModule('@mocktomata/no-support', missSupportPluginModule), PluginNotConforming)
})

test('plugin missing getSpy method throws', () => {
  a.throws(() => addPluginModule('@mocktomata/no-getspy', missGetSpyPluginModule), PluginNotConforming)
})

test('plugin missing getStub method throws', () => {
  a.throws(() => addPluginModule('@mocktomata/no-getstub', missGetStubPluginModule), PluginNotConforming)
})
