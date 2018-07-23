import t from 'assert';
import { testSpec } from '../support-util';
testSpec.trio('value types subject is itself', (title, spec) => {
    test(title, async () => {
        const expected = Symbol();
        const s = await spec(expected);
        t.strictEqual(s.subject, expected);
    });
});
//# sourceMappingURL=index.spec.js.map