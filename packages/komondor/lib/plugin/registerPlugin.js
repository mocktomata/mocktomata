"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const store_1 = require("./store");
const activationContext = {
    register(name, support, getSpy, getStub, serialize) {
        const plugins = store_1.store.get().plugins;
        if (plugins.some(p => p.type === name)) {
            throw new errors_1.PluginAlreadyLoaded(name);
        }
        plugins.unshift({ type: name, support, getSpy, getStub, serialize });
    }
};
function registerPlugin(pluginModule) {
    pluginModule.activate(activationContext);
}
exports.registerPlugin = registerPlugin;
//# sourceMappingURL=registerPlugin.js.map