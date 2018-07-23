export const stringPlugin = {
    name: 'string',
    support: subject => typeof subject === 'string',
    getSpy: (context, subject) => {
        context.newSpyRecorder(subject);
        return subject;
    },
    getStub: (context, subject) => {
        context.newStubRecorder(subject);
        return subject;
    }
};
//# sourceMappingURL=stringPlugin.js.map