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
var logging_1 = require("@unional/logging");
var tersify_1 = require("tersify");
var common_1 = require("../common");
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
}(common_1.KomondorError));
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
}(common_1.KomondorError));
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
}(common_1.KomondorError));
exports.NotSpecable = NotSpecable;
var SimulationMismatch = /** @class */ (function (_super) {
    __extends(SimulationMismatch, _super);
    // istanbul ignore next
    function SimulationMismatch(specId, expected, actual) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Recorded data for '" + specId + "' doesn't match with simulation. Expecting " + tersifyAction(expected) + " but received " + tersifyAction(actual)) || this;
        _this.specId = specId;
        _this.expected = expected;
        _this.actual = actual;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SimulationMismatch;
}(common_1.KomondorError));
exports.SimulationMismatch = SimulationMismatch;
function tersifyAction(action) {
    if (!action)
        return 'none';
    if (common_1.log.level >= logging_1.logLevel.debug) {
        return tersify_1.tersify(action, { maxLength: Infinity });
    }
    else {
        return (['a', 'e', 'i', 'o', 'u'].some(function (x) { return action.type.startsWith(x); }) ? 'an' : 'a') + " " + action.type + " action";
    }
}
//# sourceMappingURL=errors.js.map