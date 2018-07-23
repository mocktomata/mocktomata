"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function createConfigFile(cwd, config) {
    fs_1.default.writeFileSync(path_1.default.join(cwd, 'komondor.config.json'), JSON.stringify(config));
}
exports.createConfigFile = createConfigFile;
//# sourceMappingURL=createConfigFile.js.map