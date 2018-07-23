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
var KomondorError = /** @class */ (function (_super) {
    __extends(KomondorError, _super);
    function KomondorError(description) {
        var errors = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            errors[_i - 1] = arguments[_i];
        }
        return _super.apply(this, ['komondor', description].concat(errors)) || this;
    }
    return KomondorError;
}(iso_error_1.ModuleError));
exports.KomondorError = KomondorError;
//# sourceMappingURL=errors.js.map