import { ready } from '../runtime';
import { IDCannotBeEmpty } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
// import { createSimulateSpec } from './simulate';
import { createLiveSpec, createSaveSpec } from './spy';
export function createSpec(defaultMode) {
    return async (id, subject, options = { timeout: 3000 }) => {
        const { io } = await ready;
        assertSpecID(id);
        const mode = getEffectiveSpecMode(id, defaultMode);
        switch (mode) {
            case 'live':
                return createLiveSpec(subject);
            case 'save':
                return createSaveSpec({ io }, id, subject, options);
            case 'simulate':
                return createSaveSpec({ io }, id, subject, options);
            // return createSimulateSpec({ io }, id, subject)
        }
    };
}
function assertSpecID(id) {
    if (id === '')
        throw new IDCannotBeEmpty();
}
//# sourceMappingURL=createSpec.js.map