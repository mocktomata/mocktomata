"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getPlugins_1 = require("./getPlugins");
function findPlugin(subject) {
    var plugins = getPlugins_1.getPlugins();
    return plugins.find(function (p) { return p.support(subject); });
}
exports.findPlugin = findPlugin;
//# sourceMappingURL=findPlugin.js.map