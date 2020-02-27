import a from 'assertron'
import { logLevels } from 'standard-log'
import { DuplicatePlugin, loadPlugins, PluginNotConforming, PluginNotFound } from '.'
import { log } from '../log'
import { store } from '../store'
import { echoPluginModule, missGetSpyPluginModule, missGetStubPluginModule, missSupportPluginModule, noActivatePluginModule, pluginModuleA } from '../test-artifacts'
import { createTestIO } from '../test-utils'

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
test('load plugins in reverse order', async () => {

  const io = createTestIO()
  io.addPluginModule('@mocktomata/plugin-fixture-dummy', echoPluginModule)
  io.addPluginModule('@mocktomata/plugin-fixture-deep-link/pluginA', pluginModuleA)

  await loadPlugins({ io })
  const actual = store.value.plugins

  a.satisfies(actual.map(p => p.name), ['@mocktomata/plugin-fixture-deep-link/pluginA/plugin-a', '@mocktomata/plugin-fixture-dummy'])
})

test('Not existing plugin throws PluginNotFound', async () => {
  const io = createTestIO()
  io.addPluginModule('not-exist', undefined as any)

  await a.throws(() => loadPlugins({ io }), PluginNotFound)
})

test('plugin without activate function is ignored', async () => {
  const io = createTestIO()
  io.addPluginModule('@mocktomata/no-activate', noActivatePluginModule as any)

  await loadPlugins({ io })
})

test('plugin missing support method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@mocktomata/no-support', missSupportPluginModule as any)

  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})

test('plugin missing getSpy method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@mocktomata/no-getspy', missGetSpyPluginModule as any)

  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})

test('plugin missing getStub method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@mocktomata/no-getstub', missGetStubPluginModule as any)

  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})

test('registering plugin with the same name throws PluginAlreadyLoaded', async () => {
  const io = createTestIO()
  io.addPluginModule('@mocktomata/plugin-fixture-dummy', echoPluginModule)
  await loadPlugins({ io })

  await a.throws(() => loadPlugins({ io }), DuplicatePlugin)
})
