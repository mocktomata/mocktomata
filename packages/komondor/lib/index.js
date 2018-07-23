"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@komondor-lab/core");
var io_local_1 = require("@komondor-lab/io-local");
var io = io_local_1.createIO();
// TODO: Detect different platforms and load different plugins.
// e.g. NodeJS 5 does not support Promise, NodeJS 11 supports bigint
// language and platform support will change over time.
core_1.start({ io: io, libs: [] });
//# sourceMappingURL=index.js.map