import { addPluginModule } from './addPluginModule';
import { PluginNotFound } from './errors';
/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }) {
    const pluginNames = await io.getPluginList();
    return Promise.all(pluginNames.map(name => loadPlugin({ io }, name)));
}
export async function loadPlugin({ io }, moduleName) {
    const pluginModule = await tryLoad({ io }, moduleName);
    addPluginModule(moduleName, pluginModule);
}
async function tryLoad({ io }, name) {
    try {
        return await io.loadPlugin(name);
    }
    catch {
        throw new PluginNotFound(name);
    }
}
//# sourceMappingURL=loadPlugins.js.map