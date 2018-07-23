"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var mkdirp_1 = __importDefault(require("mkdirp"));
function ensureFolderCreated(dir) {
    if (!fs_1.default.existsSync(dir))
        mkdirp_1.default.sync(dir);
}
exports.ensureFolderCreated = ensureFolderCreated;
//# sourceMappingURL=ensureFolderCreated.js.map