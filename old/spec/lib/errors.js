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
var iso_error_1 = require("iso-error");
var tersify_1 = require("tersify");
var SpecError = /** @class */ (function (_super) {
    __extends(SpecError, _super);
    function SpecError(description) {
        var errors = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            errors[_i - 1] = arguments[_i];
        }
        return _super.apply(this, ['komondor-spec', description].concat(errors)) || this;
    }
    return SpecError;
}(iso_error_1.ModuleError));
exports.SpecError = SpecError;
var IDCannotBeEmpty = /** @class */ (function (_super) {
    __extends(IDCannotBeEmpty, _super);
    // istanbul ignore next
    function IDCannotBeEmpty() {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "The spec id cannot be an empty string. It should uniquely identify the spec.") || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return IDCannotBeEmpty;
}(SpecError));
exports.IDCannotBeEmpty = IDCannotBeEmpty;
var SpecNotFound = /** @class */ (function (_super) {
    __extends(SpecNotFound, _super);
    // istanbul ignore next
    function SpecNotFound(specId, reason) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Unable to find the spec record for '" + specId + "'" + (reason ? "due to: " + reason : '')) || this;
        _this.specId = specId;
        _this.reason = reason;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SpecNotFound;
}(SpecError));
exports.SpecNotFound = SpecNotFound;
var NotSpecable = /** @class */ (function (_super) {
    __extends(NotSpecable, _super);
    // istanbul ignore next
    function NotSpecable(subject) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "The " + (typeof subject === 'string' ? subject : "subject " + tersify_1.tersify(subject, { maxLength: 50 })) + " is not supported by any loaded plugins") || this;
        _this.subject = subject;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return NotSpecable;
}(SpecError));
exports.NotSpecable = NotSpecable;
var SimulationMismatch = /** @class */ (function (_super) {
    __extends(SimulationMismatch, _super);
    // istanbul ignore next
    function SimulationMismatch(specId, expected, actual) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Recorded data for '" + specId + "' doesn't match with simulation. Expecting " + tersify_1.tersify(expected, { maxLength: Infinity }) + " but received " + tersify_1.tersify(actual, { maxLength: Infinity })) || this;
        _this.specId = specId;
        _this.expected = expected;
        _this.actual = actual;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SimulationMismatch;
}(SpecError));
exports.SimulationMismatch = SimulationMismatch;
var MissingArtifact = /** @class */ (function (_super) {
    __extends(MissingArtifact, _super);
    // istanbul ignore next
    function MissingArtifact(id) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Missing artifact: " + id) || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return MissingArtifact;
}(SpecError));
exports.MissingArtifact = MissingArtifact;
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
}(SpecError));
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
}(SpecError));
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
}(SpecError));
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
}(SpecError));
exports.PluginNotConforming = PluginNotConforming;
//# sourceMappingURL=errors.js.map