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
var InvalidConfigFormat = /** @class */ (function (_super) {
    __extends(InvalidConfigFormat, _super);
    // istanbul ignore next
    function InvalidConfigFormat(filename) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "The " + filename + " does not contain a valid configuration") || this;
        _this.filename = filename;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return InvalidConfigFormat;
}(make_error_1.BaseError));
exports.InvalidConfigFormat = InvalidConfigFormat;
var AmbiguousConfig = /** @class */ (function (_super) {
    __extends(AmbiguousConfig, _super);
    // istanbul ignore next
    function AmbiguousConfig(configs) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Multiple configuration detected (" + configs.join(', ') + "). Please consolidate to one config.") || this;
        _this.configs = configs;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return AmbiguousConfig;
}(make_error_1.BaseError));
exports.AmbiguousConfig = AmbiguousConfig;
var MissingConfigForFeature = /** @class */ (function (_super) {
    __extends(MissingConfigForFeature, _super);
    // istanbul ignore next
    function MissingConfigForFeature(feature, configPath) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Configuring " + configPath + " is required to use " + feature + ".") || this;
        _this.feature = feature;
        _this.configPath = configPath;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return MissingConfigForFeature;
}(make_error_1.BaseError));
exports.MissingConfigForFeature = MissingConfigForFeature;
var ConfigPropertyIsInvalid = /** @class */ (function (_super) {
    __extends(ConfigPropertyIsInvalid, _super);
    // istanbul ignore next
    function ConfigPropertyIsInvalid(property, cause) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "The property '" + property + "' is invalid: " + cause) || this;
        _this.property = property;
        _this.cause = cause;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ConfigPropertyIsInvalid;
}(make_error_1.BaseError));
exports.ConfigPropertyIsInvalid = ConfigPropertyIsInvalid;
var ConfigPropertyNotRecognized = /** @class */ (function (_super) {
    __extends(ConfigPropertyNotRecognized, _super);
    // istanbul ignore next
    function ConfigPropertyNotRecognized(property) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "The property '" + property + "' is not a valid komondor option.") || this;
        _this.property = property;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ConfigPropertyNotRecognized;
}(make_error_1.BaseError));
exports.ConfigPropertyNotRecognized = ConfigPropertyNotRecognized;
//# sourceMappingURL=errors.js.map