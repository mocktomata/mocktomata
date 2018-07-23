export function hasPropertyInPrototype(subject) {
    let proto = subject.prototype;
    while (proto !== undefined && proto !== Object.prototype) {
        const nextProto = Object.getPrototypeOf(proto);
        // if `nextProto` is null,
        // proto is the base `{ constructor, __defineGetter__, ... }`
        if (nextProto === null)
            return false;
        // made a reasonable tradeoff assuming there will be at least one method in the class.
        // after all, there will be nothing to spy/stub if there is no method.
        if (Object.getOwnPropertyNames(proto).some(p => p !== 'constructor'))
            return true;
        proto = nextProto;
    }
    return false;
}
//# sourceMappingURL=hasPropertyInPrototype.js.map