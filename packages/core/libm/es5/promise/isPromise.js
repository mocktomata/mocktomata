export function isPromise(value) {
    return value && typeof value.then === 'function' && typeof value.catch === 'function';
}
//# sourceMappingURL=isPromise.js.map