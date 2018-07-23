import { getHash } from './getHash';
import { writeByHash } from './writeByHash';
export function writeTo(baseDir, id, json) {
    const hash = getHash(id);
    writeByHash(baseDir, id, json, hash);
}
//# sourceMappingURL=writeTo.js.map