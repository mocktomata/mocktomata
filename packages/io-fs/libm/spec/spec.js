import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
export function createSpecRepository(komondorFolder) {
    const specDir = getSpecFolder(komondorFolder);
    return {
        async readSpec(id) {
            const hash = getHash(id);
            return readByHash(specDir, id, hash);
        },
        async writeSpec(id, data) {
            ensureFolderCreated(specDir);
            writeTo(specDir, id, data);
        }
    };
}
export function getSpecFolder(komondorFolder) {
    return path.resolve(komondorFolder, 'specs');
}
//# sourceMappingURL=spec.js.map