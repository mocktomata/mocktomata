"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// istanbul ignore next
exports.missSupportPluginModule = {
    activate: function (context) {
        context.register(exports.missSupportPlugin);
    }
};
// istanbul ignore next
exports.missSupportPlugin = {
    getSpy: function () { return {}; },
    getStub: function () { return {}; },
    serialize: function () { return ''; }
};
//# sourceMappingURL=missSupportPlugin.js.map