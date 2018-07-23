import { loadPlugins, registerPlugin } from '@komondor-lab/plugin';
import { getLogger, logLevel } from '@unional/logging';
import * as functionPlugin from '../plugin-function';
import * as symbolPlugin from '../plugin-symbol';
import * as valuePlugin from '../plugin-value';
let starting;
export function start({ libs, io }) {
    starting = new Promise(async (a) => {
        libs.forEach(lib => {
            switch (lib) {
                case '@komondor-lab/value':
                    registerPlugin('@komondor-lab/value', valuePlugin);
                    break;
                case '@komondor-lab/symbol':
                    registerPlugin('@komondor-lab/symbol', symbolPlugin);
                    break;
                case '@komondor-lab/function':
                    registerPlugin('@komondor-lab/function', functionPlugin);
                    break;
            }
        });
        await loadPlugins({ io });
        const logger = getLogger('komondor', logLevel.warn);
        a({ io, logger });
    });
}
export const ready = new Promise(a => a(starting));
//# sourceMappingURL=runtime.js.map