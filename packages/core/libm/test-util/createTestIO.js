import { SpecNotFound } from '../spec';
export function createTestIO() {
    const specs = {};
    const plugins = {};
    return {
        specs,
        readSpec(id) {
            const record = specs[id];
            if (!record)
                return Promise.reject(new SpecNotFound(id));
            return Promise.resolve(JSON.parse(record));
        },
        async writeSpec(id, record) {
            specs[id] = `{
  "refs": [
    ${record.refs.map(r => JSON.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => JSON.stringify(a)).join(',\n    ')}
  ]
}`;
        },
        addPluginModule(moduleName, pluginModule) {
            plugins[moduleName] = pluginModule;
        },
        addPlugin(moduleName, ...plugins) {
            this.addPluginModule(moduleName, {
                activate(c) {
                    plugins.forEach(p => c.register(p));
                }
            });
        },
        getPluginList() {
            return Promise.resolve(Object.keys(plugins));
        },
        loadPlugin(name) {
            const m = plugins[name];
            if (m)
                return Promise.resolve(m);
            throw new Error('module not found');
        }
    };
}
//# sourceMappingURL=createTestIO.js.map