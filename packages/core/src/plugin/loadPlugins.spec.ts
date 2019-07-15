import a from 'assertron';
import { DuplicatePlugin, loadPlugins, NoActivate, PluginNotConforming, PluginNotFound } from '.';
import { resetStore, store } from '../store';
import { echoPluginModule, missGetSpyPluginModule, missGetStubPluginModule, missSupportPluginModule, noActivatePluginModule, pluginModuleA } from '../test-artifacts';
import { createTestIO } from '../test-util';

beforeEach(() => {
  resetStore()
})

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/plugin-fixture-dummy', echoPluginModule)
  io.addPluginModule('@komondor-lab/plugin-fixture-deep-link/pluginA', pluginModuleA)

  await loadPlugins({ io })
  const actual = store.get().plugins
  a.satisfies(actual.map(p => p.name), ['@komondor-lab/plugin-fixture-deep-link/pluginA/plugin-a', '@komondor-lab/plugin-fixture-dummy'])
})

test('Not existing plugin throws PluginNotFound', async () => {
  const io = createTestIO()
  io.addPluginModule('not-exist', undefined as any)
  await a.throws(() => loadPlugins({ io }), PluginNotFound)
})


test('registering plugin with the same name throws PluginAlreadyLoaded', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/plugin-fixture-dummy', echoPluginModule)

  await loadPlugins({ io })

  await a.throws(() => loadPlugins({ io }), DuplicatePlugin)
})

test('plugin without activate function throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/no-activate', noActivatePluginModule as any)
  await a.throws(() => loadPlugins({ io }), NoActivate)
})

test('plugin missing support method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/no-support', missSupportPluginModule as any)
  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})

test('plugin missing getSpy method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/no-getspy', missGetSpyPluginModule as any)
  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})

test('plugin missing getStub method throws', async () => {
  const io = createTestIO()
  io.addPluginModule('@komondor-lab/no-getstub', missGetStubPluginModule as any)

  await a.throws(() => loadPlugins({ io }), PluginNotConforming)
})
