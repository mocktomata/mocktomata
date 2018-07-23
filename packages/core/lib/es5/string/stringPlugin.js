"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringPlugin = {
    name: 'string',
    support: function (subject) { return typeof subject === 'string'; },
    getSpy: function (context, subject) {
        context.newSpyRecorder(subject);
        return subject;
    },
    getStub: function (context, subject) {
        context.newStubRecorder(subject);
        return subject;
    }
};
//# sourceMappingURL=stringPlugin.js.map