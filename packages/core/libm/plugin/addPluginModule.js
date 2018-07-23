import { store } from '../store';
import { DuplicatePlugin, NoActivate, PluginNotConforming } from './errors';
export function addPluginModule(moduleName, pluginModule) {
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
//# sourceMappingURL=addPluginModule.js.map