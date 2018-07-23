import { SpecNotFound, ScenarioNotFound } from '@komondor-lab/core';
import { createFileRepository } from '@komondor-lab/io-fs';
import { context } from './context';
export function createIO(options) {
    const repo = options ?
        context.get().repository = createFileRepository(options.cwd) :
        context.get().repository;
    return {
        async readSpec(id) {
            try {
                const specStr = await repo.readSpec(id);
                return JSON.parse(specStr);
            }
            catch {
                throw new SpecNotFound(id);
            }
        },
        async writeSpec(id, record) {
            return repo.writeSpec(id, JSON.stringify(record));
        },
        async readScenario(id) {
            try {
                const specStr = await repo.readScenario(id);
                return JSON.parse(specStr);
            }
            catch {
                throw new ScenarioNotFound(id);
            }
        },
        async writeScenario(id, record) {
            return repo.writeScenario(id, JSON.stringify(record));
        },
        async getPluginList() {
            return repo.getPluginList();
        },
        async loadPlugin(name) {
            return require(name);
        }
    };
}
//# sourceMappingURL=createIO.js.map