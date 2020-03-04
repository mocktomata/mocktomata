import a from 'assertron'
import { startsWith } from 'satisfier'
import { logLevels } from 'standard-log'
import { DuplicatePlugin, loadPlugins, PluginNotConforming, PluginNotFound } from '.'
import { log } from '../log'
import { echoPluginModule, missGetSpyPluginModule, missGetStubPluginModule, missSupportPluginModule, noActivatePluginModule, pluginModuleA } from '../test-artifacts'
import { createTestContext } from '../test-utils'

beforeEach(() => {
  log.level = logLevels.none
  // store.reset()
})

afterEach(() => {
  log.level = undefined
})

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/plugin-fixture-dummy', '@mocktomata/plugin-fixture-deep-link/pluginA'] },
    pluginModuleMap: {
      '@mocktomata/plugin-fixture-dummy': echoPluginModule,
      '@mocktomata/plugin-fixture-deep-link/pluginA': pluginModuleA
    }
  })

  const { plugins } = await loadPlugins(context)

  a.satisfies(plugins.map(p => p.name), startsWith(['@mocktomata/plugin-fixture-deep-link/pluginA/plugin-a', '@mocktomata/plugin-fixture-dummy']))
})

test('Not existing plugin throws PluginNotFound', async () => {
  const context = createTestContext({
    config: { plugins: ['not-exist'] },
  })

  await a.throws(() => loadPlugins(context), PluginNotFound)
})

test('plugin without activate function is ignored', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/no-activate'] },
    pluginModuleMap: {
      '@mocktomata/no-activate': noActivatePluginModule as any
    }
  })

  await loadPlugins(context)
})

test('plugin missing support method throws', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/no-support'] },
    pluginModuleMap: {
      '@mocktomata/no-support': missSupportPluginModule as any
    }
  })
  await a.throws(() => loadPlugins(context), PluginNotConforming)
})

test('plugin missing getSpy method throws', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/no-getspy'] },
    pluginModuleMap: {
      '@mocktomata/no-getspy': missGetSpyPluginModule as any
    }
  })

  await a.throws(() => loadPlugins(context), PluginNotConforming)
})

test('plugin missing getStub method throws', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/no-getstub'] },
    pluginModuleMap: {
      '@mocktomata/no-getstub': missGetStubPluginModule as any
    }
  })

  await a.throws(() => loadPlugins(context), PluginNotConforming)
})

test('registering plugin with the same name throws DuplicatePlugin', async () => {
  const context = createTestContext({
    config: { plugins: ['@mocktomata/plugin-fixture-dummy', '@mocktomata/plugin-fixture-dummy'] },
    pluginModuleMap: {
      '@mocktomata/plugin-fixture-dummy': echoPluginModule
    }
  })

  await a.throws(() => loadPlugins(context), DuplicatePlugin)
})
