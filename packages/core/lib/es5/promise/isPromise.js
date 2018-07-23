"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPromise(value) {
    return value && typeof value.then === 'function' && typeof value.catch === 'function';
}
exports.isPromise = isPromise;
//# sourceMappingURL=isPromise.js.map