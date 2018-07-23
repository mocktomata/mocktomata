"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorPlugin = {
    name: 'error',
    support: function (subject) { return subject instanceof Error; },
    getSpy: function (_, subject) { return subject; },
    getStub: function (_, subject) { return subject; },
    serialize: function (subject) { return JSON.stringify({ message: subject.message }); },
    deserialize: function (input) { return new Error(JSON.parse(input).message); }
};
//# sourceMappingURL=errorPlugin.js.map