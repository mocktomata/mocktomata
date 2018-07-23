"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valuePlugin = {
    support: function (subject) {
        var type = typeof subject;
        return type === 'boolean' ||
            type === 'number' ||
            type === 'string' ||
            type === 'undefined' ||
            subject === null;
    },
    getSpy: function (_, subject) { return subject; },
    getStub: function (_, subject) { return subject; },
    serialize: function (subject) { return '' + subject; }
};
//# sourceMappingURL=valuePlugin.js.map