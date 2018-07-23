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
var ServerNotAvailable = /** @class */ (function (_super) {
    __extends(ServerNotAvailable, _super);
    function ServerNotAvailable(url) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Unable to connect to server at " + url) || this;
        _this.url = url;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ServerNotAvailable;
}(make_error_1.BaseError));
exports.ServerNotAvailable = ServerNotAvailable;
// istanbul ignore next
var ServerNotAvailableAtPortRange = /** @class */ (function (_super) {
    __extends(ServerNotAvailableAtPortRange, _super);
    function ServerNotAvailableAtPortRange(url, start, end) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Unable to find komondor server at " + url + " between port " + start + " and " + end) || this;
        _this.url = url;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ServerNotAvailableAtPortRange;
}(make_error_1.BaseError));
exports.ServerNotAvailableAtPortRange = ServerNotAvailableAtPortRange;
//# sourceMappingURL=errors.js.map