// istanbul ignore next
export const missGetStubPluginModule = {
    activate(context) {
        context.register(missGetStubPlugin);
    }
};
// istanbul ignore next
export const missGetStubPlugin = {
    support() { return false; },
    getSpy() { return {}; },
    serialize() { return ''; }
};
//# sourceMappingURL=missGetStubPlugin.js.map