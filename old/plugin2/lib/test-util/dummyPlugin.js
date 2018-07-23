"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// istanbul ignore next
exports.dummyPluginModule = {
    activate: function (context) {
        context.register(exports.dummyPlugin);
    }
};
// istanbul ignore next
exports.dummyPlugin = {
    support: function () { return true; },
    getSpy: function () { return {}; },
    getStub: function () { return {}; },
    serialize: function () { return ''; }
};
//# sourceMappingURL=dummyPlugin.js.map