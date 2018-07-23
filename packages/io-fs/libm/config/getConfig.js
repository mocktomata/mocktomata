import { required } from 'unpartial';
import { KOMONDOR_FOLDER } from '../constants';
import { store } from '../store';
import { loadConfig } from './loadConfig';
const defaultConfig = {
    komondorFolder: KOMONDOR_FOLDER
};
export function getConfig(cwd) {
    const config = store.get().config;
    if (config)
        return config;
    const c = loadConfig(cwd);
    const newConfig = required(defaultConfig, c);
    store.get().config = newConfig;
    return newConfig;
}
//# sourceMappingURL=getConfig.js.map