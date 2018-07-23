"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("../store");
var errors_1 = require("./errors");
function addPluginModule(moduleName, pluginModule) {
    assertModuleConfirming(moduleName, pluginModule);
    pluginModule.activate({
        register: function (plugin) {
            assertPluginConfirming(plugin);
            var pluginName = plugin.name ? moduleName + "/" + plugin.name : moduleName;
            var plugins = store_1.store.get().plugins;
            if (plugins.some(function (p) { return p.name === pluginName; })) {
                throw new errors_1.DuplicatePlugin(pluginName);
            }
            plugins.unshift(__assign({}, plugin, { name: pluginName }));
        }
    });
}
exports.addPluginModule = addPluginModule;
function assertModuleConfirming(moduleName, pluginModule) {
    if (typeof pluginModule.activate !== 'function') {
        throw new errors_1.NoActivate(moduleName);
    }
}
function assertPluginConfirming(plugin) {
    if (!plugin ||
        typeof plugin.support !== 'function' ||
        typeof plugin.getSpy !== 'function' ||
        typeof plugin.getStub !== 'function')
        throw new errors_1.PluginNotConforming(plugin.name);
}
//# sourceMappingURL=addPluginModule.js.map