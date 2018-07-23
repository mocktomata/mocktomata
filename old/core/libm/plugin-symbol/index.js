export function activate(activationContext) {
    activationContext.register({
        support: subject => {
            const type = typeof subject;
            return type === 'symbol' || (type === 'object' && Object.prototype.toString.call(subject) === '[object Symbol]');
        },
        getSpy: (_, subject) => subject,
        getStub: (_, subject) => subject,
        serialize: subject => subject
    });
}
//# sourceMappingURL=index.js.map