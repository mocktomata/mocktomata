// istanbul ignore next
export const echoPluginModule = {
    activate(context) {
        context.register(echoPlugin);
    }
};
// istanbul ignore next
export const echoPlugin = {
    support() { return true; },
    getSpy(_, s) { return s; },
    getStub(_, s) { return s; }
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
//# sourceMappingURL=plugins.js.map