import { AssertOrder } from 'assertron';
import { ready, start } from '.';
import { createInMemoryIO } from '../test-util/createInMemoryIO';
test('ready will wait for start to complete', async () => {
    const o = new AssertOrder(2);
    // tslint:disable-next-line: no-floating-promises
    ready.then(() => {
        o.once(2);
    });
    o.once(1);
    start({ io: createInMemoryIO(), libs: [] });
    o.end();
});
//# sourceMappingURL=runtime.spec.js.map