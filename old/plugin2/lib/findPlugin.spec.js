"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var dummyPlugin_1 = require("./test-util/dummyPlugin");
test('not supported subject gets undefined', function () {
    var notSupportedSubject = { oh: 'no' };
    expect(_1.findPlugin(notSupportedSubject)).toBe(undefined);
});
test('supported', function () {
    _1.registerPlugin('dummy', {
        activate: function (context) {
            context.register(dummyPlugin_1.dummyPlugin);
        }
    });
    var actual = _1.findPlugin({});
    expect(actual).not.toBeUndefined();
});
//# sourceMappingURL=findPlugin.spec.js.map