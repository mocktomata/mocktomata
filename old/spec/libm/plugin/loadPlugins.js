import { DuplicatePlugin, NoActivate, PluginNotConforming, PluginNotFound } from '../errors';
import { store } from '../store';
/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }) {
    const pluginNames = await io.getPluginList();
    return Promise.all(pluginNames.map(name => loadPlugin({ io }, name)));
}
export async function loadPlugin({ io }, moduleName) {
    const pluginModule = await tryLoad({ io }, moduleName);
    assertModuleConfirming(moduleName, pluginModule);
    pluginModule.activate({
        register(plugin) {
            assertPluginConfirming(plugin);
            const pluginName = plugin.name ? `${moduleName}/${plugin.name}` : moduleName;
            const plugins = store.get().plugins;
            if (plugins.some(p => p.name === pluginName)) {
                throw new DuplicatePlugin(pluginName);
            }
            plugins.unshift({ ...plugin, name: pluginName });
        }
    });
}
async function tryLoad({ io }, name) {
    try {
        return await io.loadPlugin(name);
    }
    catch {
        throw new PluginNotFound(name);
    }
}
function assertModuleConfirming(moduleName, pluginModule) {
    if (typeof pluginModule.activate !== 'function') {
        throw new NoActivate(moduleName);
    }
}
function assertPluginConfirming(plugin) {
    if (!plugin ||
        typeof plugin.support !== 'function' ||
        typeof plugin.getSpy !== 'function' ||
        typeof plugin.getStub !== 'function')
        throw new PluginNotConforming(plugin.name);
}
//# sourceMappingURL=loadPlugins.js.map