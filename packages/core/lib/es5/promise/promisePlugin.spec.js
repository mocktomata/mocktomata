"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promisePlugin_1 = require("./promisePlugin");
test('simple object is not supported by promisePlugin', function () {
    expect(promisePlugin_1.promisePlugin.support({})).toBe(false);
});
test('support promise object', function () {
    var prom = Promise.resolve();
    expect(promisePlugin_1.promisePlugin.support(prom)).toBe(true);
});
//# sourceMappingURL=promisePlugin.spec.js.map