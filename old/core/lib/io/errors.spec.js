"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
test('invalid format', function () {
    var err = new _1.InvalidConfigFormat('k.json');
    expect(err.filename).toBe('k.json');
});
//# sourceMappingURL=errors.spec.js.map