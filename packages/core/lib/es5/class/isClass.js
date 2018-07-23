"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isClass(subject) {
    return typeof subject === 'function' &&
        hasPropertyInPrototype(subject);
}
exports.isClass = isClass;
function hasPropertyInPrototype(subject) {
    var proto = subject.prototype;
    while (proto !== undefined && proto !== Object.prototype) {
        var nextProto = Object.getPrototypeOf(proto);
        // if `nextProto` is null,
        // proto is the base `{ constructor, __defineGetter__, ... }`
        if (nextProto === null)
            return false;
        // made a reasonable tradeoff assuming there will be at least one method in the class.
        // after all, there will be nothing to spy/stub if there is no method.
        if (Object.getOwnPropertyNames(proto).some(function (p) { return p !== 'constructor'; }))
            return true;
        proto = nextProto;
    }
    return false;
}
//# sourceMappingURL=isClass.js.map