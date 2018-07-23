"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io_fs_1 = require("@komondor-lab/io-fs");
var global_store_1 = require("global-store");
var defaultContext = {
    repository: io_fs_1.createFileRepository(process.cwd())
};
exports.context = global_store_1.createStore('@komondor-lab/io-local/context', defaultContext);
//# sourceMappingURL=context.js.map