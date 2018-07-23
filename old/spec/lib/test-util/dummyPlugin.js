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
//# sourceMappingURL=dummyPlugin.js.map