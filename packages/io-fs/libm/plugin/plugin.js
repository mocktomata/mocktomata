import { findByKeywords } from 'find-installed-packages';
import { KOMONODR_PLUGIN_KEYWORD } from '../constants';
export function createPluginRepository({ cwd, config }) {
    return {
        async getPluginList() {
            if (config.plugins)
                return config.plugins;
            return findByKeywords([KOMONODR_PLUGIN_KEYWORD], { cwd });
        },
        async loadPlugin(name) {
            return require(name);
        }
    };
}
//# sourceMappingURL=plugin.js.map