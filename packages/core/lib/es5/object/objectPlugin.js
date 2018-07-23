"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectPlugin = {
    name: 'object',
    support: function (subject) { return subject !== null && typeof subject === 'object'; },
    getSpy: function (context, subject) {
        return subject;
    },
    getStub: function (context, subject) {
        return subject;
    }
};
//# sourceMappingURL=objectPlugin.js.map