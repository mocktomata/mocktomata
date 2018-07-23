import { getLogger } from '@unional/logging';
import a from 'assertron';
import { context, IDCannotBeEmpty, spec } from '..';
import { createTestIO } from '../test-util';
beforeAll(() => {
    const log = getLogger('komondor');
    const io = createTestIO();
    context.set({ io, log });
});
test('id cannot be an empty string', async () => {
    await a.throws(() => spec('', { a: 1 }), IDCannotBeEmpty);
    await a.throws(() => spec.live('', { a: 1 }), IDCannotBeEmpty);
    await a.throws(() => spec.save('', { a: 1 }), IDCannotBeEmpty);
    await a.throws(() => spec.replay('', { a: 1 }), IDCannotBeEmpty);
});
//# sourceMappingURL=spec.spec.js.map