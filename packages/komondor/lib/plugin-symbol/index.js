"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function activate(activationContext) {
    activationContext.register('symbol', subject => {
        const type = typeof subject;
        return type === 'symbol' || (type === 'object' && Object.prototype.toString.call(subject) === '[object Symbol]');
    }, (_, subject) => subject, (_, subject) => subject, subject => subject);
}
exports.activate = activate;
//# sourceMappingURL=index.js.map