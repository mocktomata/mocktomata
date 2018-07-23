"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var primitivePlugin_1 = require("./primitivePlugin");
test('support primitive', function () {
    expect(primitivePlugin_1.primitivePlugin.support(undefined)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(null)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(true)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(false)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(-1)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(0)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support(1)).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support('')).toBe(true);
    expect(primitivePlugin_1.primitivePlugin.support('abc')).toBe(true);
});
test('support symbol even it is not es5', function () {
    expect(primitivePlugin_1.primitivePlugin.support(Symbol())).toBe(true);
});
//# sourceMappingURL=primitivePlugin.spec.js.map