import a from 'assertron'
import { startsWith } from 'satisfier'
import { createTestContext, DuplicatePlugin, loadPlugins, PluginModuleNotConforming, PluginNotConforming, PluginNotFound } from '../index.js'
import { echoPluginModule, missGetSpyPluginModule, missGetStubPluginModule, missSupportPluginModule, noActivatePluginModule, pluginModuleA } from '../test-artifacts/index.js'

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/plugin-fixture-dummy', '@mocktomata/plugin-fixture-deep-link/pluginA'] },
    modules: {
      '@mocktomata/plugin-fixture-dummy': echoPluginModule,
      '@mocktomata/plugin-fixture-deep-link/pluginA': pluginModuleA
    }
  })

  const { plugins } = await context.extend(loadPlugins).get()

  a.satisfies(plugins.map(p => p.name), startsWith(['@mocktomata/plugin-fixture-deep-link/pluginA/plugin-a', '@mocktomata/plugin-fixture-dummy']))
})

test('Not existing plugin throws PluginNotFound', async () => {
  const { context } = createTestContext({
    config: { plugins: ['not-exist'] },
  })

  await a.throws(() => context
    .extend(loadPlugins).get(), PluginNotFound)
})

it('throws PluginModuleNotConforming when the plugin missing activate function', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/no-activate'] },
    modules: {
      '@mocktomata/no-activate': noActivatePluginModule as any
    }
  })

  await a.throws(() => context.extend(loadPlugins).get(), PluginModuleNotConforming)
})

it('throws PluginModuleNotConforming when the plugin activate export is not a function', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/no-activate'] },
    modules: {
      '@mocktomata/no-activate': { activate: 123 } as any
    }
  })

  await a.throws(() => context.extend(loadPlugins).get(), PluginModuleNotConforming)
})

test('plugin missing support method throws', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/no-support'] },
    modules: {
      '@mocktomata/no-support': missSupportPluginModule as any
    }
  })
  await a.throws(() => context.extend(loadPlugins).get(), PluginNotConforming)
})

test('plugin missing getSpy method throws', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/no-getspy'] },
    modules: {
      '@mocktomata/no-getspy': missGetSpyPluginModule as any
    }
  })

  await a.throws(() => context.extend(loadPlugins).get(), PluginNotConforming)
})

test('plugin missing getStub method throws', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/no-getstub'] },
    modules: {
      '@mocktomata/no-getstub': missGetStubPluginModule as any
    }
  })

  await a.throws(() => context.extend(loadPlugins).get(), PluginNotConforming)
})

test('registering plugin with the same name throws DuplicatePlugin', async () => {
  const { context } = createTestContext({
    config: { plugins: ['@mocktomata/plugin-fixture-dummy', '@mocktomata/plugin-fixture-dummy'] },
    modules: {
      '@mocktomata/plugin-fixture-dummy': echoPluginModule
    }
  })

  await a.throws(() => context.extend(loadPlugins).get(), DuplicatePlugin)
})
