import { PluginAlreadyLoaded, PluginNotConforming } from './errors';
import { getPlugins } from './getPlugins';
export function registerPlugin(pluginName, pluginModule) {
    assertModuleConfirming(pluginName, pluginModule);
    pluginModule.activate({
        register(plugin) {
            const p = createInstance(pluginName, plugin);
            const plugins = getPlugins();
            if (plugins.some(p => p.name === pluginName)) {
                throw new PluginAlreadyLoaded(pluginName);
            }
            plugins.unshift(p);
        }
    });
}
function assertModuleConfirming(pluginName, pluginModule) {
    if (typeof pluginModule.activate !== 'function') {
        throw new PluginNotConforming(pluginName);
    }
}
function createInstance(name, plugin) {
    if (!(plugin.getSpy && plugin.getStub && plugin.support)) {
        throw new PluginNotConforming(name);
    }
    return { ...plugin, name };
}
//# sourceMappingURL=registerPlugin.js.map