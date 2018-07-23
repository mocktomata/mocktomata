export function createMemoryIO() {
    const specs = {};
    const plugins = {};
    return {
        readSpec(id) {
            return Promise.resolve(specs[id]);
        },
        async writeSpec(id, record) {
            specs[id] = record;
        },
        addPlugin(name, plugin) {
            plugins[name] = plugin;
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
//# sourceMappingURL=createMemoryIO.js.map