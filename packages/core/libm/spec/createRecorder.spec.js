import { logLevel } from '@unional/logging';
import a from 'assertron';
import delay from 'delay';
import { createTestHarness, NotSpecable } from '..';
import { createRecorder } from './createRecorder';
const specOptions = { timeout: 30 };
describe('timeout warning', () => {
    let harness;
    beforeEach(async () => {
        harness = createTestHarness({ showLog: false });
    });
    afterEach(() => harness.reset());
    test(`log a warning message if stop() was not called within specified 'timeout'.`, async () => {
        const recorder = createRecorder(harness, 'timeout', { timeout: 10 });
        await delay(30);
        await recorder.end();
        a.satisfies(harness.appender.logs, [{ id: 'komondor', level: logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }]);
    });
    test(`not log warning message if stop() is called before the specified 'timeout'.`, async () => {
        const recorder = createRecorder(harness, 'timeout', { timeout: 10 });
        await recorder.end();
        await delay(30);
        a.satisfies(harness.appender.logs, []);
    });
    test(`not log warning message if save() is called before the specified 'timeout'.`, async () => {
        const recorder = createRecorder(harness, 'timeout', { timeout: 10 });
        await recorder.save();
        await delay(30);
        a.satisfies(harness.appender.logs, []);
    });
});
test('getSpy() on non-string primitives throw NotSpecable', () => {
    const harness = createTestHarness();
    const recorder = createRecorder(harness, 'throw not specable', specOptions);
    a.throws(() => recorder.getSpy(undefined), NotSpecable);
    a.throws(() => recorder.getSpy(null), NotSpecable);
    a.throws(() => recorder.getSpy(1), NotSpecable);
    a.throws(() => recorder.getSpy(true), NotSpecable);
    a.throws(() => recorder.getSpy(Symbol()), NotSpecable);
});
// const specRecord = {
//   refs: {
//     '1': {
//       plugin: 'es5/function',
//       subjectId: 1,
//       invokeId: 1
//       // no value means it is from real time
//     },
//     '2': {
//       plugin: 'es5/error',
//       value: { message: 'abc' }
//     },
//     '3': {
//       plugin: 'es5/string',
//       value: 'actual string'
//     },
//     '4': {
//       plugin: 'es2015/symbol',
//       value: 'get from input or create in real time'
//     },
//     '5': {
//       plugin: 'es5/function',
//       value: 'from real time'
//     }
//   },
//   actions: [
//     { type: 'invoke', payload: ['2', '4'], ref: '1' },
//     { type: 'invoke', payload: [], ref: '4' }
//   ]
// }
//# sourceMappingURL=createRecorder.spec.js.map