import { createLocalIO } from '@komondor-lab/io-local';
import a from 'assertron';
import { getPlugins, loadPlugins, PluginNotFound } from '.';

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
  const io = createLocalIO()
  const pluginNames = ['@komondor-lab/plugin-fixture-dummy', '@komondor-lab/plugin-fixture-deep-link/pluginA']
  await loadPlugins({ io }, pluginNames)
  const actual = getPlugins()
  a.satisfies(actual.map(p => p.name), ['@komondor-lab/plugin-fixture-deep-link/pluginA', '@komondor-lab/plugin-fixture-dummy'])
})

test('Not existing plugin throws PluginNotFound', async () => {
  const io = createLocalIO()
  await a.throws(() => loadPlugins({ io }, ['not-exist']), PluginNotFound)
})
