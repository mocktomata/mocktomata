import path from 'path';
import { ensureFolderCreated, getHash, readByHash, writeTo } from '../util';
export function createScenarioRepository(komondorFolder) {
    const dir = getScenarioFolder(komondorFolder);
    return {
        async readScenario(id) {
            const hash = getHash(id);
            return readByHash(dir, id, hash);
        },
        async writeScenario(id, data) {
            ensureFolderCreated(dir);
            writeTo(dir, id, data);
        }
    };
}
export function getScenarioFolder(komondorFolder) {
    return path.resolve(komondorFolder, 'scenarios');
}
//# sourceMappingURL=scenario.js.map