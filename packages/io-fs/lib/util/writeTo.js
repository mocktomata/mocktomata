"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getHash_1 = require("./getHash");
var writeByHash_1 = require("./writeByHash");
function writeTo(baseDir, id, json) {
    var hash = getHash_1.getHash(id);
    writeByHash_1.writeByHash(baseDir, id, json, hash);
}
exports.writeTo = writeTo;
//# sourceMappingURL=writeTo.js.map