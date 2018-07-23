export const valuePlugin = {
    support: subject => {
        const type = typeof subject;
        return type === 'boolean' ||
            type === 'number' ||
            type === 'string' ||
            type === 'undefined' ||
            subject === null;
    },
    getSpy(_, subject) { return subject; },
    getStub: (_, subject) => subject,
    serialize: subject => '' + subject
};
//# sourceMappingURL=valuePlugin.js.map