import { spec } from '../spec';
export function testLiveSpec(specId, handler) {
    handler(`${specId}: live`, s => spec(specId, s));
}
//# sourceMappingURL=testLiveSpec.js.map