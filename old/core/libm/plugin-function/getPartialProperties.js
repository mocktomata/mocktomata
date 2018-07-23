export function getPartialProperties(subject) {
    const otherPropertyNames = Object.keys(subject);
    if (otherPropertyNames.length === 0)
        return undefined;
    return otherPropertyNames.reduce((p, k) => {
        p[k] = subject[k];
        return p;
    }, {});
}
//# sourceMappingURL=getPartialProperties.js.map