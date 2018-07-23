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
var isPromise_1 = require("../promise/isPromise");
var getPropertyNames_1 = require("./getPropertyNames");
function spyClass(context, subject) {
    var recorder = context.newSpyRecorder({ className: subject.name });
    var spiedClass = /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, args) || this;
            // tslint:disable-next-line:variable-name
            _this.__komondor = {};
            _this.__komondor.instance = recorder.construct(args);
            return _this;
        }
        return class_1;
    }(subject));
    var propertyNames = getPropertyNames_1.getPropertyNames(spiedClass);
    propertyNames.forEach(function (p) {
        var method = spiedClass.prototype[p];
        spiedClass.prototype[p] = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var invoking = this.__komondor.invoking;
            var instance = this.__komondor.instance;
            if (!invoking) {
                this.__komondor.invoking = true;
                var call = instance.newCall({ methodName: p });
                var spiedArgs = call.invoke(args);
                var result = void 0;
                try {
                    result = method.apply(this, spiedArgs);
                }
                catch (err) {
                    var thrown = call.throw(err);
                    this.__komondor.invoking = false;
                    throw thrown;
                }
                var returnValue = call.return(result);
                // TODO: rethink SpyCall implmentation to avoid mixing promise and class logic together
                // This is not ideal as it mixes concerns.
                if (isPromise_1.isPromise(returnValue)) {
                    returnValue.then(function () { return _this.__komondor.invoking = false; });
                }
                else
                    this.__komondor.invoking = false;
                return returnValue;
            }
            else {
                return method.apply(this, args);
            }
        };
    });
    return spiedClass;
}
exports.spyClass = spyClass;
//# sourceMappingURL=spyClass.js.map