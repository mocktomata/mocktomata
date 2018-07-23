import { store } from '../store';
export function findPlugin(subject) {
    const plugins = store.get().plugins;
    return plugins.find(p => p.support(subject));
}
export function getPlugin(pluginName) {
    const plugins = store.get().plugins;
    return plugins.find(p => p.name === pluginName);
}
//# sourceMappingURL=findPlugin.js.map