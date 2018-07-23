import { getHash } from './getHash';
import t from 'assert';
test('accepts empty string as id', () => {
    const actual = getHash('');
    is32CharString(actual);
});
test('accepts unique code', () => {
    const actual = getHash('中文');
    is32CharString(actual);
});
function is32CharString(actual) {
    t(/\w{32}/.test(actual));
}
//# sourceMappingURL=getHash.spec.js.map