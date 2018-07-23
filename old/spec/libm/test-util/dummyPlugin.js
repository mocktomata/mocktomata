// istanbul ignore next
export const dummyPluginModule = {
    activate(context) {
        context.register(dummyPlugin);
    }
};
// istanbul ignore next
export const dummyPlugin = {
    support() { return true; },
    getSpy() { return {}; },
    getStub() { return {}; },
    serialize() { return ''; }
};
// istanbul ignore next
export const pluginModuleA = {
    activate(context) {
        context.register(pluginA);
    }
};
// istanbul ignore next
export const pluginA = {
    name: 'plugin-a',
    support() { return true; },
    getSpy() { return {}; },
    getStub() { return {}; },
    serialize() { return ''; }
};
//# sourceMappingURL=dummyPlugin.js.map