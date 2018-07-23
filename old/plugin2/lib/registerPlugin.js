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
var errors_1 = require("./errors");
var getPlugins_1 = require("./getPlugins");
function registerPlugin(pluginName, pluginModule) {
    assertModuleConfirming(pluginName, pluginModule);
    pluginModule.activate({
        register: function (plugin) {
            var p = createInstance(pluginName, plugin);
            var plugins = getPlugins_1.getPlugins();
            if (plugins.some(function (p) { return p.name === pluginName; })) {
                throw new errors_1.PluginAlreadyLoaded(pluginName);
            }
            plugins.unshift(p);
        }
    });
}
exports.registerPlugin = registerPlugin;
function assertModuleConfirming(pluginName, pluginModule) {
    if (typeof pluginModule.activate !== 'function') {
        throw new errors_1.PluginNotConforming(pluginName);
    }
}
function createInstance(name, plugin) {
    if (!(plugin.getSpy && plugin.getStub && plugin.support)) {
        throw new errors_1.PluginNotConforming(name);
    }
    return __assign({}, plugin, { name: name });
}
//# sourceMappingURL=registerPlugin.js.map