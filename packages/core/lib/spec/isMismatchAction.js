"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var satisfier_1 = require("satisfier");
var type_plus_1 = require("type-plus");
function isMismatchAction(actual, expected) {
    var expectation = createActionExpectation(expected);
    return !satisfier_1.createSatisfier(expectation).test(actual);
}
exports.isMismatchAction = isMismatchAction;
function createActionExpectation(action) {
    return __assign({}, action, { payload: createExpectationValue(action.payload) });
}
function createExpectationValue(value) {
    if (value === null)
        return satisfier_1.anything;
    if (Array.isArray(value))
        return value.map(function (v) { return createExpectationValue(v); });
    if (typeof value === 'object') {
        return type_plus_1.reduceKey(value, function (p, k) {
            p[k] = createExpectationValue(value[k]);
            return p;
        }, {});
    }
    return value;
}
//# sourceMappingURL=isMismatchAction.js.map