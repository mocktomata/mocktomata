import { testLiveSpec } from './testLiveSpec';
import { testSaveSpec } from './testSaveSpec';
import { testSimulateSpec } from './testSimulateSpec';
export function testTrioSpec(spedId, handler) {
    testLiveSpec(spedId, handler);
    testSaveSpec(spedId, handler);
    testSimulateSpec(spedId, handler);
}
//# sourceMappingURL=testTrioSpec.js.map