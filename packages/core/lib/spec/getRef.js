"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param target target is the spy or stub of the subject.
 */
function getRef(record, target) {
    var specRef = record.refs.find(function (ref) { return ref.target === target; });
    if (specRef)
        return specRef.ref;
    var ref = String(record.refs.length + 1);
    record.refs.push({ target: target, ref: ref });
    return ref;
}
exports.getRef = getRef;
//# sourceMappingURL=getRef.js.map