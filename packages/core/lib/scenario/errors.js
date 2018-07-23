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
var common_1 = require("../common");
var ScenarioNotFound = /** @class */ (function (_super) {
    __extends(ScenarioNotFound, _super);
    // istanbul ignore next
    function ScenarioNotFound(id) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, "Cannot find scenario '" + id + "'") || this;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ScenarioNotFound;
}(common_1.KomondorError));
exports.ScenarioNotFound = ScenarioNotFound;
//# sourceMappingURL=errors.js.map