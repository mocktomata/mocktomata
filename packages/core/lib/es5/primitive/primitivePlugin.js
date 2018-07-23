"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitivePlugin = {
    name: 'primitive',
    support: function (subject) {
        var t = typeof subject;
        return subject === null || t !== 'function' && t !== 'object';
    },
    getSpy: function (_, subject) { return subject; },
    getStub: function (_, subject) { return subject; }
};
//# sourceMappingURL=primitivePlugin.js.map