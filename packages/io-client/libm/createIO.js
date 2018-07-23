import fetch from 'cross-fetch';
import { createIOInternal } from './createIOInternal';
export async function createIO(options) {
    return createIOInternal({ fetch, location }, options);
}
//# sourceMappingURL=createIO.js.map