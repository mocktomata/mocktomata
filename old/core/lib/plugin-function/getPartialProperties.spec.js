"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var getPartialProperties_1 = require("./getPartialProperties");
test('no properties returns undefined', function () {
    assert_1.default.strictEqual(getPartialProperties_1.getPartialProperties(function () { return false; }), undefined);
    assert_1.default.strictEqual(getPartialProperties_1.getPartialProperties(function () { return false; }), undefined);
});
test('no properties returns undefined', function () {
    var actual = getPartialProperties_1.getPartialProperties(function () { return false; });
    assert_1.default.strictEqual(actual, undefined);
});
//# sourceMappingURL=getPartialProperties.spec.js.map