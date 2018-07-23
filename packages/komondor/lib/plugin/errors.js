"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_error_1 = require("make-error");
class PluginAlreadyLoaded extends make_error_1.BaseError {
    // istanbul ignore next
    constructor(pluginName) {
        super(`Plugin ${pluginName} is already loaded.`);
        this.pluginName = pluginName;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.PluginAlreadyLoaded = PluginAlreadyLoaded;
//# sourceMappingURL=errors.js.map