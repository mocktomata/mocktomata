"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("./store");
function getPlugins() {
    return store_1.store.get().plugins;
}
exports.getPlugins = getPlugins;
//# sourceMappingURL=getPlugins.js.map