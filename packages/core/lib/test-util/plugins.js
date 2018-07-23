"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// istanbul ignore next
exports.echoPluginModule = {
    activate: function (context) {
        context.register(exports.echoPlugin);
    }
};
// istanbul ignore next
exports.echoPlugin = {
    support: function () { return true; },
    getSpy: function (_, s) { return s; },
    getStub: function (_, s) { return s; }
};
// istanbul ignore next
exports.pluginModuleA = {
    activate: function (context) {
        context.register(exports.pluginA);
    }
};
// istanbul ignore next
exports.pluginA = {
    name: 'plugin-a',
    support: function () { return true; },
    getSpy: function () { return {}; },
    getStub: function () { return {}; },
    serialize: function () { return ''; }
};
//# sourceMappingURL=plugins.js.map