"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("../function");
var testSubjects_1 = require("../testSubjects");
test('do not supports primitive types other than functions', function () {
    expect(function_1.functionPlugin.support(undefined)).toBe(false);
    expect(function_1.functionPlugin.support(null)).toBe(false);
    expect(function_1.functionPlugin.support(0)).toBe(false);
    expect(function_1.functionPlugin.support(true)).toBe(false);
    expect(function_1.functionPlugin.support('a')).toBe(false);
    expect(function_1.functionPlugin.support(Symbol())).toBe(false);
    expect(function_1.functionPlugin.support({})).toBe(false);
    expect(function_1.functionPlugin.support([])).toBe(false);
});
test('support simple function', function () {
    expect(function_1.functionPlugin.support(function foo() { return; })).toBeTruthy();
    expect(function_1.functionPlugin.support(function () { return; })).toBeTruthy();
});
test('support arrow function', function () {
    expect(function_1.functionPlugin.support(function () { return false; })).toBeTruthy();
});
test('not support class', function () {
    expect(function_1.functionPlugin.support(testSubjects_1.Dummy)).toBeFalsy();
});
//# sourceMappingURL=functionPlugin.spec.js.map