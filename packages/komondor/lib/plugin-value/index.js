"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function activate(activationContext) {
    activationContext.register('value', subject => {
        const type = typeof subject;
        return type === 'boolean' ||
            type === 'number' ||
            type === 'string' ||
            type === 'undefined' ||
            subject === null;
    }, (_, subject) => subject, (_, subject) => subject, subject => subject);
}
exports.activate = activate;
//# sourceMappingURL=index.js.map