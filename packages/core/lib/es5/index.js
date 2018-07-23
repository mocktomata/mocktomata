"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("./function");
var string_1 = require("./string");
var object_1 = require("./object");
var error_1 = require("./error");
function activate(context) {
    context.register(string_1.stringPlugin);
    context.register(error_1.errorPlugin);
    context.register(object_1.objectPlugin);
    context.register(function_1.functionPlugin);
}
exports.activate = activate;
//# sourceMappingURL=index.js.map