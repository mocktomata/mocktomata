import { reduceKey } from 'type-plus';
export function assignPropertiesIfNeeded(target, properties) {
    return properties ? Object.assign(target, properties) : target;
}
export function getPartialProperties(subject) {
    const otherPropertyNames = Object.keys(subject);
    if (otherPropertyNames.length === 0)
        return undefined;
    return reduceKey(subject, (p, k) => {
        p[k] = subject[k];
        return p;
    }, {});
}
//# sourceMappingURL=composeWithSubject.js.map