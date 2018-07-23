import a from 'assertron';
import { loadPlugins, PluginNotFound } from '.';
import { getPlugins } from './getPlugins';
import { dummyPluginModule } from './test-util/dummyPlugin';
/**
 * Plugin order is reversed so that most specific plugin are checked first.
 */
test('load plugins in reverse order', async () => {
    const io = createPluginIO({
        '@komondor-lab/plugin-fixture-dummy': dummyPluginModule,
        '@komondor-lab/plugin-fixture-deep-link/pluginA': dummyPluginModule
    });
    await loadPlugins({ io });
    const actual = getPlugins();
    a.satisfies(actual.map(p => p.name), ['@komondor-lab/plugin-fixture-deep-link/pluginA', '@komondor-lab/plugin-fixture-dummy']);
});
test('Not existing plugin throws PluginNotFound', async () => {
    const io = createPluginIO({ 'not-exist': undefined });
    await a.throws(() => loadPlugins({ io }), PluginNotFound);
});
function createPluginIO(plugins) {
    return {
        loadPlugin: name => {
            const m = plugins[name];
            if (m)
                return Promise.resolve(m);
            throw new Error('module not found');
        },
        getPluginList: () => Promise.resolve(Object.keys(plugins))
    };
}
//# sourceMappingURL=loadPlugins.spec.js.map