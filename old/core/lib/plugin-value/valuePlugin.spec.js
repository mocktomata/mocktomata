"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var valuePlugin_1 = require("./valuePlugin");
var valueTypes = [false, 1, 'a', undefined, null, NaN];
test.each(valueTypes)('Supports %s', function (value) {
    expect(valuePlugin_1.valuePlugin.support(value)).toBe(true);
});
//# sourceMappingURL=valuePlugin.spec.js.map