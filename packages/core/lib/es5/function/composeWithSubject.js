"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_plus_1 = require("type-plus");
function assignPropertiesIfNeeded(target, properties) {
    return properties ? Object.assign(target, properties) : target;
}
exports.assignPropertiesIfNeeded = assignPropertiesIfNeeded;
function getPartialProperties(subject) {
    var otherPropertyNames = Object.keys(subject);
    if (otherPropertyNames.length === 0)
        return undefined;
    return type_plus_1.reduceKey(subject, function (p, k) {
        p[k] = subject[k];
        return p;
    }, {});
}
exports.getPartialProperties = getPartialProperties;
//# sourceMappingURL=composeWithSubject.js.map