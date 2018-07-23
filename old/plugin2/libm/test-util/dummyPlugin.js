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
//# sourceMappingURL=dummyPlugin.js.map