"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const getPartialProperties_1 = require("./getPartialProperties");
test('no properties returns undefined', () => {
    assert_1.default.strictEqual(getPartialProperties_1.getPartialProperties(() => false), undefined);
    assert_1.default.strictEqual(getPartialProperties_1.getPartialProperties(function () { return false; }), undefined);
});
test('no properties returns undefined', () => {
    const actual = getPartialProperties_1.getPartialProperties(function () { return false; });
    assert_1.default.strictEqual(actual, undefined);
});
//# sourceMappingURL=getPartialProperties.spec.js.map