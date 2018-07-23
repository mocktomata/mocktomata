"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var getHash_1 = require("./getHash");
var assert_1 = __importDefault(require("assert"));
test('accepts empty string as id', function () {
    var actual = getHash_1.getHash('');
    is32CharString(actual);
});
test('accepts unique code', function () {
    var actual = getHash_1.getHash('中文');
    is32CharString(actual);
});
function is32CharString(actual) {
    assert_1.default(/\w{32}/.test(actual));
}
//# sourceMappingURL=getHash.spec.js.map