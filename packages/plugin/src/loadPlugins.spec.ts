import a from 'assertron';
import { loadPlugins, PluginNotFound } from '.';
import { getPlugins } from './getPlugins';
import { PluginIO } from './interfaces';
import { dummyPluginModule } from './test-util/dummyPlugin';

/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
  const io = createPluginIO(() => Promise.resolve(dummyPluginModule))
  const pluginNames = ['@komondor-lab/plugin-fixture-dummy', '@komondor-lab/plugin-fixture-deep-link/pluginA']
  await loadPlugins({ io }, pluginNames)
  const actual = getPlugins()
  a.satisfies(actual.map(p => p.name), ['@komondor-lab/plugin-fixture-deep-link/pluginA', '@komondor-lab/plugin-fixture-dummy'])
})

test('Not existing plugin throws PluginNotFound', async () => {
  const io = createPluginIO(() => { throw new Error('module not found') })
  await a.throws(() => loadPlugins({ io }, ['not-exist']), PluginNotFound)
})

function createPluginIO(loadPlugin: PluginIO['loadPlugin']) {
  return { loadPlugin }
}
