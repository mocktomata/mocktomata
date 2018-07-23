import { spec } from '../spec';
export function testSimulateSpec(specId, handler) {
    handler(`${specId}: simulate`, s => spec.simulate(specId, s));
}
//# sourceMappingURL=testSimulateSpec.js.map