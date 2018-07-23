"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function activate(activationContext) {
    activationContext.register({
        support: function (subject) {
            var type = typeof subject;
            return type === 'symbol' || (type === 'object' && Object.prototype.toString.call(subject) === '[object Symbol]');
        },
        getSpy: function (_, subject) { return subject; },
        getStub: function (_, subject) { return subject; },
        serialize: function (subject) { return subject; }
    });
}
exports.activate = activate;
//# sourceMappingURL=index.js.map