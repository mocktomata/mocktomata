"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var config_1 = require("./config");
var plugin_1 = require("./plugin");
var scenario_1 = require("./scenario");
var spec_1 = require("./spec");
function createFileRepository(cwd) {
    var config = config_1.getConfig(cwd);
    var komondorFolder = path_1.default.resolve(cwd, config.komondorFolder);
    var spec = spec_1.createSpecRepository(komondorFolder);
    var scenario = scenario_1.createScenarioRepository(komondorFolder);
    var plugin = plugin_1.createPluginRepository({ cwd: cwd, config: config });
    return __assign({}, spec, scenario, plugin);
}
exports.createFileRepository = createFileRepository;
//# sourceMappingURL=createFileRepository.js.map