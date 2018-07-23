// This is komonodor exposed as window.komondor. Used by developer to control komondor behavior.
// developer can control spec and scenario behaviors, but not config.
// config is done by the application startup code.
import { createIO } from '@komondor-lab/io-client';
import { getLogger, logLevel } from '@unional/logging';
import { createContext } from 'async-fp';
import { registerPlugin, loadPlugins } from '@komondor-lab/plugin';
export const ctx = createContext(async () => {
    const logger = getLogger('komondor', logLevel.warn);
    const io = await createIO();
    const libs = [];
    libs.forEach(async (lib) => {
        registerPlugin(lib, await io.loadPlugin(lib));
    });
    await loadPlugins({ io });
    return { logger, io };
});
export const config = {
    spec(mode, ...filters) {
        return;
    },
    scenario(mode, ...filters) {
        return;
    }
};
//# sourceMappingURL=komondor.js.map