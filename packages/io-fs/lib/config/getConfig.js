"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var unpartial_1 = require("unpartial");
var constants_1 = require("../constants");
var store_1 = require("../store");
var loadConfig_1 = require("./loadConfig");
var defaultConfig = {
    komondorFolder: constants_1.KOMONDOR_FOLDER
};
function getConfig(cwd) {
    var config = store_1.store.get().config;
    if (config)
        return config;
    var c = loadConfig_1.loadConfig(cwd);
    var newConfig = unpartial_1.required(defaultConfig, c);
    store_1.store.get().config = newConfig;
    return newConfig;
}
exports.getConfig = getConfig;
//# sourceMappingURL=getConfig.js.map