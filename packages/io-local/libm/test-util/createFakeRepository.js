import { createFileRepository } from '@komondor-lab/io-fs';
import path from 'path';
export function createFakeRepository() {
    const cwd = path.resolve(__dirname, '../../fixtures/with-plugin');
    const repo = createFileRepository(cwd);
    const { readScenario, readSpec } = repo;
    const specs = {
        'exist': '{ "actions": [] }'
    };
    const scenarios = {
        'exist': '{ "scenario": "exist" }'
    };
    repo.writeSpec = (id, data) => {
        specs[id] = data;
        return Promise.resolve();
    };
    repo.readSpec = (id) => {
        if (specs[id])
            return Promise.resolve(specs[id]);
        return readSpec(id);
    };
    repo.writeScenario = (id, data) => {
        scenarios[id] = data;
        return Promise.resolve();
    };
    repo.readScenario = id => {
        if (scenarios[id])
            return Promise.resolve(scenarios[id]);
        return readScenario(id);
    };
    return repo;
}
//# sourceMappingURL=createFakeRepository.js.map