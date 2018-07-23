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
var errors_1 = require("../spec/errors");
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
}(errors_1.SpecError));
exports.PluginNotFound = PluginNotFound;
var DuplicatePlugin = /** @class */ (function (_super) {
    __extends(DuplicatePlugin, _super);
    // istanbul ignore next
    function DuplicatePlugin(pluginName) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "A plugin with the name '" + pluginName + "' has already been loaded.") || this;
        _this.pluginName = pluginName;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return DuplicatePlugin;
}(errors_1.SpecError));
exports.DuplicatePlugin = DuplicatePlugin;
var NoActivate = /** @class */ (function (_super) {
    __extends(NoActivate, _super);
    function NoActivate(moduleName) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, moduleName + " does not export an 'activate()' function") || this;
        _this.moduleName = moduleName;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return NoActivate;
}(errors_1.SpecError));
exports.NoActivate = NoActivate;
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
}(errors_1.SpecError));
exports.PluginNotConforming = PluginNotConforming;
//# sourceMappingURL=errors.js.map