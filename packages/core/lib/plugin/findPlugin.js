"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("../store");
function findPlugin(subject) {
    var plugins = store_1.store.get().plugins;
    return plugins.find(function (p) { return p.support(subject); });
}
exports.findPlugin = findPlugin;
function getPlugin(pluginName) {
    var plugins = store_1.store.get().plugins;
    return plugins.find(function (p) { return p.name === pluginName; });
}
exports.getPlugin = getPlugin;
//# sourceMappingURL=findPlugin.js.map