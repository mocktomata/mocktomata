/**
 * @param target target is the spy or stub of the subject.
 */
export function getRef(record, target) {
    const specRef = record.refs.find(ref => ref.target === target);
    if (specRef)
        return specRef.ref;
    const ref = String(record.refs.length + 1);
    record.refs.push({ target, ref });
    return ref;
}
//# sourceMappingURL=getRef.js.map