import path from 'path';
import { getConfig } from './config';
import { createPluginRepository } from './plugin';
import { createScenarioRepository } from './scenario';
import { createSpecRepository } from './spec';
export function createFileRepository(cwd) {
    const config = getConfig(cwd);
    const komondorFolder = path.resolve(cwd, config.komondorFolder);
    const spec = createSpecRepository(komondorFolder);
    const scenario = createScenarioRepository(komondorFolder);
    const plugin = createPluginRepository({ cwd, config });
    return {
        ...spec,
        ...scenario,
        ...plugin
    };
}
//# sourceMappingURL=createFileRepository.js.map