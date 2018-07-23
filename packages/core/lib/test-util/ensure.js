"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var rimraf_1 = __importDefault(require("rimraf"));
function ensureFileNotExists(filepath) {
    if (fs_1.default.existsSync(filepath)) {
        fs_1.default.unlinkSync(filepath);
    }
}
exports.ensureFileNotExists = ensureFileNotExists;
function ensureDirNotExists(dirpath) {
    if (fs_1.default.existsSync(dirpath)) {
        rimraf_1.default.sync(dirpath);
    }
}
exports.ensureDirNotExists = ensureDirNotExists;
//# sourceMappingURL=ensure.js.map