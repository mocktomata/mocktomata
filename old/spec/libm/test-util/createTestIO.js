export function createTestIO() {
    const specs = {};
    const plugins = {};
    return {
        readSpec(id) {
            return Promise.resolve(specs[id]);
        },
        async writeSpec(id, record) {
            specs[id] = record;
        },
        addPluginModule(moduleName, pluginModule) {
            plugins[moduleName] = pluginModule;
        },
        addPlugin(moduleName, plugin) {
            this.addPluginModule(moduleName, { activate(c) { c.register(plugin); } });
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