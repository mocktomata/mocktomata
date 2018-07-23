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
var tersify_1 = require("tersify");
var SourceNotFound = /** @class */ (function (_super) {
    __extends(SourceNotFound, _super);
    // istanbul ignore next
    function SourceNotFound(action) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Unable to locate source action for " + tersify_1.tersify(action, { maxLength: Infinity })) || this;
        _this.action = action;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SourceNotFound;
}(make_error_1.BaseError));
exports.SourceNotFound = SourceNotFound;
//# sourceMappingURL=errors.js.map