import { store } from '../store';
export function findPlugin(subject) {
    const plugins = store.get().plugins;
    return plugins.find(p => p.support(subject));
}
//# sourceMappingURL=findPlugin.js.map