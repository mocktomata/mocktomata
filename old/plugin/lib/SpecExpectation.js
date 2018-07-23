"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createExpectation(type, name, baseMeta) {
    return (payload, meta) => {
        if (!baseMeta && !meta)
            return { type, name, payload };
        return { type, name, payload, meta: Object.assign({}, baseMeta, meta) };
    };
}
exports.createExpectation = createExpectation;
function createScopedCreateExpectation(scope) {
    return (subType, name, baseMeta) => (payload, meta) => {
        if (!baseMeta && !meta)
            return { type: `${scope}/${subType}`, name, payload };
        return { type: `${scope}/${subType}`, name, payload, meta: Object.assign({}, baseMeta, meta) };
    };
}
exports.createScopedCreateExpectation = createScopedCreateExpectation;
//# sourceMappingURL=SpecExpectation.js.map