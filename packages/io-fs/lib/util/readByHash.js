"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function readByHash(baseDir, id, hash, dupId) {
    if (dupId === void 0) { dupId = 0; }
    var filename = dupId ? hash + dupId : hash;
    var filePath = path_1.default.join(baseDir, filename);
    var content = fs_1.default.readFileSync(filePath, 'utf-8');
    var _a = content.split('\n', 2), firstLine = _a[0], specStr = _a[1];
    if (firstLine !== id) {
        return readByHash(baseDir, id, hash, dupId + 1);
    }
    return specStr;
}
exports.readByHash = readByHash;
//# sourceMappingURL=readByHash.js.map