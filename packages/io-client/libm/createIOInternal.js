import { ScenarioNotFound, SpecNotFound } from '@komondor-lab/core';
import { buildUrl } from './buildUrl';
import { getServerInfo } from './getServerInfo';
export async function createIOInternal({ fetch, location }, options) {
    const info = await getServerInfo({ fetch, location }, options);
    return {
        async readSpec(id) {
            const response = await fetch(buildUrl(info.url, `specs/${id}`));
            if (response.status === 404) {
                throw new SpecNotFound(id);
            }
            return response.json();
        },
        async writeSpec(id, record) {
            const response = await fetch(buildUrl(info.url, `specs/${id}`), { method: 'POST', body: JSON.stringify(record) });
            // istanbul ignore next
            if (!response.ok) {
                throw new Error(`failed to write spec: ${response.statusText}`);
            }
        },
        async readScenario(id) {
            const response = await fetch(buildUrl(info.url, `scenarios/${id}`));
            if (response.status === 404) {
                throw new ScenarioNotFound(id);
            }
            return response.json();
        },
        async writeScenario(id, record) {
            const response = await fetch(buildUrl(info.url, `scenarios/${id}`), { method: 'POST', body: JSON.stringify(record) });
            // istanbul ignore next
            if (!response.ok) {
                throw new Error(`failed to write scenario: ${response.statusText}`);
            }
        },
        async getPluginList() {
            return info.plugins;
        },
        async loadPlugin(name) {
            return import(name);
        },
    };
}
//# sourceMappingURL=createIOInternal.js.map