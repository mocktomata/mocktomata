import { findPlugin, registerPlugin } from '.';
import { dummyPlugin } from './test-util/dummyPlugin';
test('not supported subject gets undefined', () => {
    const notSupportedSubject = { oh: 'no' };
    expect(findPlugin(notSupportedSubject)).toBe(undefined);
});
test('supported', () => {
    registerPlugin('dummy', {
        activate(context) {
            context.register(dummyPlugin);
        }
    });
    const actual = findPlugin({});
    expect(actual).not.toBeUndefined();
});
//# sourceMappingURL=findPlugin.spec.js.map