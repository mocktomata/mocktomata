import { PluginNotFound } from './errors';
import { registerPlugin } from './registerPlugin';
/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }) {
    const pluginNames = await io.getPluginList();
    return Promise.all(pluginNames.map(async (name) => {
        const m = await tryLoad({ io }, name);
        registerPlugin(name, m);
    }));
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