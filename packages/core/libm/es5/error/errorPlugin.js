export const errorPlugin = {
    name: 'error',
    support: subject => subject instanceof Error,
    getSpy: (_, subject) => subject,
    getStub: (_, subject) => subject,
    serialize: (subject) => JSON.stringify({ message: subject.message }),
    deserialize: (input) => new Error(JSON.parse(input).message)
};
//# sourceMappingURL=errorPlugin.js.map