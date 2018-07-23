"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_store_1 = require("global-store");
var store = global_store_1.createStore('@komondor-lab/io-fs', { config: undefined });
exports.store = store;
function resetStore() {
    store.set({ config: undefined });
}
exports.resetStore = resetStore;
//# sourceMappingURL=store.js.map