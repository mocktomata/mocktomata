"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var validate_js_1 = __importDefault(require("validate.js"));
function validate(_a, value, constraints) {
    var ui = _a.ui;
    var failure = validate_js_1.default(value, constraints);
    if (failure === undefined)
        return true;
    Object.keys(failure).forEach(function (k) {
        var messages = failure[k];
        ui.error.apply(ui, messages);
    });
    return false;
}
exports.validate = validate;
//# sourceMappingURL=validate.js.map