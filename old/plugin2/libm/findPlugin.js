import { getPlugins } from './getPlugins';
export function findPlugin(subject) {
    const plugins = getPlugins();
    return plugins.find(p => p.support(subject));
}
//# sourceMappingURL=findPlugin.js.map