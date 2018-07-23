import { spec } from '../spec';
export function testSaveSpec(specId, handler) {
    handler(`${specId}: save`, s => spec.save(specId, s));
}
//# sourceMappingURL=testSaveSpec.js.map