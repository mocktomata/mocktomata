import t from 'assert';
import { testSpec } from '../support-util';
import { simpleCallback } from './testSuite';
testSpec.trio('work with basic callback', (title, spec) => {
    test(title, async () => {
        const s = await spec(simpleCallback.success);
        let actual;
        function increment(callback, value) {
            callback(value, (err, response) => {
                if (err)
                    throw err;
                actual = response;
            });
        }
        increment(s.subject, 3);
        t.strictEqual(actual, 4);
        return s.done();
    });
});
testSpec.live('work with promise callback', (title, spec) => {
    test(title, async () => {
        const s = await spec(simpleCallback.success);
        const actual = await simpleCallback.increment(s.subject, 3);
        t.strictEqual(actual, 4);
        return s.done();
    });
});
//# sourceMappingURL=index.spec.js.map