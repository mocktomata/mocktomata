// istanbul ignore next
export const missSupportPluginModule = {
    activate(context) {
        context.register(missSupportPlugin);
    }
};
// istanbul ignore next
export const missSupportPlugin = {
    getSpy() { return {}; },
    getStub() { return {}; },
    serialize() { return ''; }
};
//# sourceMappingURL=missSupportPlugin.js.map