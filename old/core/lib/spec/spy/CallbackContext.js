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
var unpartial_1 = require("unpartial");
var InvocationContext_1 = require("./InvocationContext");
var CallbackContext = /** @class */ (function (_super) {
    __extends(CallbackContext, _super);
    function CallbackContext(context, pluginType, spyCall, sourceSite) {
        var _this = _super.call(this, context, pluginType) || this;
        _this.spyCall = spyCall;
        _this.sourceSite = sourceSite;
        return _this;
    }
    CallbackContext.prototype.construct = function (_a) {
        var args = _a.args, meta = _a.meta;
        var instanceId = this.getNextId(this.pluginType);
        var action = {
            name: 'construct',
            payload: args,
            meta: meta,
            instanceId: instanceId,
            sourceType: this.spyCall.instance.invocation.pluginType,
            sourceInstanceId: this.spyCall.instance.instanceId,
            sourceInvokeId: this.spyCall.invokeId,
            sourceSite: this.sourceSite
        };
        this.addAction(action);
        return new CallbackInstance(this, instanceId, this.pluginType);
    };
    return CallbackContext;
}(InvocationContext_1.InvocationContext));
exports.CallbackContext = CallbackContext;
var CallbackInstance = /** @class */ (function (_super) {
    __extends(CallbackInstance, _super);
    function CallbackInstance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallbackInstance.prototype.newCall = function (callMeta) {
        return new CallbackCall(this, ++this.invokeCount, callMeta);
    };
    return CallbackInstance;
}(InvocationContext_1.Instance));
exports.CallbackInstance = CallbackInstance;
var CallbackCall = /** @class */ (function (_super) {
    __extends(CallbackCall, _super);
    function CallbackCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallbackCall.prototype.invoke = function (args, meta) {
        this.instance.addAction({
            name: 'invoke',
            payload: args,
            meta: this.callMeta ? unpartial_1.unpartial(this.callMeta, meta) : meta,
            invokeId: this.invokeId
        });
        return args;
    };
    return CallbackCall;
}(InvocationContext_1.Call));
exports.CallbackCall = CallbackCall;
//# sourceMappingURL=CallbackContext.js.map