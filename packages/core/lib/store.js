"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_store_1 = require("global-store");
exports.store = global_store_1.createStore('@komondor-lab/core', {
    specTypeIds: {},
    plugins: []
});
function resetStore() {
    exports.store.set({
        specTypeIds: {},
        plugins: []
    });
}
exports.resetStore = resetStore;
//# sourceMappingURL=store.js.map