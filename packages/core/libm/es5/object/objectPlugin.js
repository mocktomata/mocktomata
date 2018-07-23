export const objectPlugin = {
    name: 'object',
    support: subject => subject !== null && typeof subject === 'object',
    getSpy: (context, subject) => {
        return subject;
    },
    getStub: (context, subject) => {
        return subject;
    }
};
//# sourceMappingURL=objectPlugin.js.map