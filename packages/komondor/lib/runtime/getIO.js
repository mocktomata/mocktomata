"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io_local_1 = require("@komondor-lab/io-local");
exports.io = io_local_1.createLocalIO();
function getIO() {
    return Promise.resolve(io_local_1.createLocalIO());
}
exports.getIO = getIO;
//# sourceMappingURL=getIO.js.map