import a from 'assertron';
import { createTestHarness, NotSpecable } from '..';
import { createPlayer } from './createPlayer';
const specOptions = { timeout: 30 };
test('getStub() on non-string primitives throw NotSpecable', () => {
    const harness = createTestHarness();
    const player = createPlayer(harness, 'throw not specable', specOptions);
    a.throws(() => player.getStub(undefined), NotSpecable);
    a.throws(() => player.getStub(null), NotSpecable);
    a.throws(() => player.getStub(1), NotSpecable);
    a.throws(() => player.getStub(true), NotSpecable);
    a.throws(() => player.getStub(Symbol()), NotSpecable);
});
//# sourceMappingURL=createPlayer.spec.js.map