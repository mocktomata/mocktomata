"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// istanbul ignore next
exports.missGetStubPluginModule = {
    activate: function (context) {
        context.register(exports.missGetStubPlugin);
    }
};
// istanbul ignore next
exports.missGetStubPlugin = {
    support: function () { return false; },
    getSpy: function () { return {}; },
    serialize: function () { return ''; }
};
//# sourceMappingURL=missGetStubPlugin.js.map