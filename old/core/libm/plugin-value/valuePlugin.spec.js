import { valuePlugin } from './valuePlugin';
const valueTypes = [false, 1, 'a', undefined, null, NaN];
test.each(valueTypes)('Supports %s', (value) => {
    expect(valuePlugin.support(value)).toBe(true);
});
//# sourceMappingURL=valuePlugin.spec.js.map