import { context } from '../context';
import { createLiveSpec } from './capture';
import { IDCannotBeEmpty } from '../errors';
export function createSpec(defaultMode) {
    return async (id, subject, options = { timeout: 3000 }) => {
        const { io, log } = await context.get();
        assertSpecID(id);
        return createLiveSpec({ io, log }, id, subject, options);
        // const mode = getEffectiveSpecMode(id, defaultMode)
        // switch (mode) {
        //   case 'live':
        //     return createLiveSpec({ io, log }, id, subject, options)
        // case 'save':
        //   return createSaveSpec({ io, log }, id, subject, options)
        // case 'simulate':
        //   return createSaveSpec({ io, log }, id, subject, options)
        // return createSimulateSpec({ io }, id, subject)
        // }
    };
}
function assertSpecID(id) {
    if (id === '')
        throw new IDCannotBeEmpty();
}
//# sourceMappingURL=createSpec.js.map