import { InvalidConfigFormat } from '.';
test('invalid format', () => {
    const err = new InvalidConfigFormat('k.json');
    expect(err.filename).toBe('k.json');
});
//# sourceMappingURL=errors.spec.js.map