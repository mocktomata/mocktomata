import { createSatisfier, anything } from 'satisfier';
import { reduceKey } from 'type-plus';
export function isMismatchAction(actual, expected) {
    const expectation = createActionExpectation(expected);
    return !createSatisfier(expectation).test(actual);
}
function createActionExpectation(action) {
    return {
        ...action,
        payload: createExpectationValue(action.payload)
    };
}
function createExpectationValue(value) {
    if (value === null)
        return anything;
    if (Array.isArray(value))
        return value.map(v => createExpectationValue(v));
    if (typeof value === 'object') {
        return reduceKey(value, (p, k) => {
            p[k] = createExpectationValue(value[k]);
            return p;
        }, {});
    }
    return value;
}
//# sourceMappingURL=isMismatchAction.js.map