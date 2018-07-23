"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_store_1 = require("global-store");
var createDefaultConfig_1 = require("./createDefaultConfig");
var store = global_store_1.createStore('@komondor/config', createDefaultConfig_1.createDefaultConfig());
exports.store = store;
//# sourceMappingURL=store.js.map