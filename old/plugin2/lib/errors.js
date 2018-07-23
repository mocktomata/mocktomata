"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var make_error_1 = require("make-error");
var PluginNotFound = /** @class */ (function (_super) {
    __extends(PluginNotFound, _super);
    // istanbul ignore next
    function PluginNotFound(pluginName) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Could not locate plugin '" + pluginName + "'") || this;
        _this.pluginName = pluginName;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return PluginNotFound;
}(make_error_1.BaseError));
exports.PluginNotFound = PluginNotFound;
var PluginAlreadyLoaded = /** @class */ (function (_super) {
    __extends(PluginAlreadyLoaded, _super);
    // istanbul ignore next
    function PluginAlreadyLoaded(pluginName) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "A plugin with the name '" + pluginName + "' has already been loaded.") || this;
        _this.pluginName = pluginName;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return PluginAlreadyLoaded;
}(make_error_1.BaseError));
exports.PluginAlreadyLoaded = PluginAlreadyLoaded;
var PluginNotConforming = /** @class */ (function (_super) {
    __extends(PluginNotConforming, _super);
    // istanbul ignore next
    function PluginNotConforming(pluginName) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, pluginName + " is not a plugin.") || this;
        _this.pluginName = pluginName;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return PluginNotConforming;
}(make_error_1.BaseError));
exports.PluginNotConforming = PluginNotConforming;
//# sourceMappingURL=errors.js.map