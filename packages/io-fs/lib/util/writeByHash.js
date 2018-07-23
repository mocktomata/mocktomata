"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function writeByHash(baseDir, id, json, hash, dupId) {
    if (dupId === void 0) { dupId = 0; }
    var filename = dupId ? hash + dupId : hash;
    var filePath = path_1.default.join(baseDir, filename);
    if (occupiedFile(filePath, id)) {
        writeByHash(baseDir, id, json, hash, dupId + 1);
    }
    else {
        fs_1.default.writeFileSync(filePath, id + "\n" + json);
    }
}
exports.writeByHash = writeByHash;
function occupiedFile(filepath, id) {
    if (!fs_1.default.existsSync(filepath))
        return false;
    var content = fs_1.default.readFileSync(filepath, 'utf-8');
    var firstline = content.split('\n')[0];
    return id !== firstline;
}
//# sourceMappingURL=writeByHash.js.map