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
var InvocationContext_1 = require("./InvocationContext");
var ReturnValueContext = /** @class */ (function (_super) {
    __extends(ReturnValueContext, _super);
    function ReturnValueContext(context, pluginType, returnAction) {
        var _this = _super.call(this, context, pluginType) || this;
        _this.returnAction = returnAction;
        return _this;
    }
    ReturnValueContext.prototype.construct = function (options) {
        var instance = _super.prototype.construct.call(this, options);
        this.returnAction.returnInstanceId = instance.instanceId;
        return instance;
    };
    return ReturnValueContext;
}(InvocationContext_1.InvocationContext));
exports.ReturnValueContext = ReturnValueContext;
//# sourceMappingURL=ReturnValueContext.js.map