"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var errors_1 = require("./errors");
function loadConfig(cwd) {
    var configs = {
        pjson: loadPjsonConfig(cwd),
        kjson: loadKjsonConfig(cwd),
        kjs: loadKjsConfig(cwd)
    };
    var names = Object.keys(configs).filter(function (k) { return !!configs[k]; });
    if (names.length === 0)
        return {};
    if (names.length > 1)
        throw new errors_1.AmbiguousConfig(names);
    var config = configs[names[0]];
    return config;
}
exports.loadConfig = loadConfig;
function loadPjsonConfig(cwd) {
    var pjsonPath = path_1.default.resolve(cwd, 'package.json');
    if (fs_1.default.existsSync(pjsonPath)) {
        var pjson = require(pjsonPath);
        if (pjson.komondor)
            return pjson.komondor;
    }
}
function loadKjsonConfig(cwd) {
    var filepath = path_1.default.resolve(cwd, '.komondor.json');
    if (fs_1.default.existsSync(filepath)) {
        try {
            return require(filepath);
        }
        catch (e) {
            if (e.name === 'SyntaxError') {
                throw new errors_1.InvalidConfigFormat('.komondor.json');
            }
        }
    }
}
function loadKjsConfig(cwd) {
    var filepath = path_1.default.resolve(cwd, '.komondor.js');
    if (fs_1.default.existsSync(filepath)) {
        try {
            return require(filepath);
        }
        catch (e) {
            if (e.name === 'SyntaxError') {
                throw new errors_1.InvalidConfigFormat('.komondor.js');
            }
        }
    }
}
//# sourceMappingURL=loadConfig.js.map