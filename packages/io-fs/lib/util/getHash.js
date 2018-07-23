"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var md5_1 = __importDefault(require("md5"));
function getHash(id) {
    return md5_1.default(id);
}
exports.getHash = getHash;
//# sourceMappingURL=getHash.js.map