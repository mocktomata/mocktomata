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
var getPropertyNames_1 = require("./getPropertyNames");
function stubClass(context, subject) {
    var player = context.newStubRecorder({ className: subject.name });
    var stubClass = /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, args) || this;
            // tslint:disable-next-line:variable-name
            _this.__komondorStub = {};
            _this.__komondorStub.instance = player.construct(args);
            return _this;
        }
        return class_1;
    }(subject));
    getPropertyNames_1.getPropertyNames(stubClass).forEach(function (p) {
        stubClass.prototype[p] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var instance = this.__komondorStub.instance;
            var call = instance.newCall({ methodName: p });
            call.invoked(args);
            call.blockUntilReturn();
            if (call.succeed()) {
                return call.result();
            }
            throw call.thrown();
        };
    });
    return stubClass;
}
exports.stubClass = stubClass;
//# sourceMappingURL=stubClass.js.map