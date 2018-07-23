"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// istanbul ignore next
exports.missGetSpyPluginModule = {
    activate: function (context) {
        context.register(exports.missGetSpyPlugin);
    }
};
// istanbul ignore next
exports.missGetSpyPlugin = {
    support: function () { return false; },
    getStub: function () { return {}; },
    serialize: function () { return ''; }
};
//# sourceMappingURL=missGetSpyPlugin.js.map