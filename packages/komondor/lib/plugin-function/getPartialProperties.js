"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPartialProperties(subject) {
    const otherPropertyNames = Object.keys(subject);
    if (otherPropertyNames.length === 0)
        return undefined;
    return otherPropertyNames.reduce((p, k) => {
        p[k] = subject[k];
        return p;
    }, {});
}
exports.getPartialProperties = getPartialProperties;
//# sourceMappingURL=getPartialProperties.js.map