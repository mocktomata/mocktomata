"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getPlugins_1 = require("./getPlugins");
function findSupportingPlugin(subject) {
    const plugins = getPlugins_1.getPlugins();
    return plugins.find(p => p.support(subject));
}
exports.findSupportingPlugin = findSupportingPlugin;
//# sourceMappingURL=findSupportingPlugin.js.map