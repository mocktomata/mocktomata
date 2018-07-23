"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stringPlugin_1 = require("./stringPlugin");
test('support string', function () {
    expect(stringPlugin_1.stringPlugin.support('')).toBe(true);
    expect(stringPlugin_1.stringPlugin.support(' ')).toBe(true);
    expect(stringPlugin_1.stringPlugin.support("abc")).toBe(true);
});
//# sourceMappingURL=stringPlugin.spec.js.map