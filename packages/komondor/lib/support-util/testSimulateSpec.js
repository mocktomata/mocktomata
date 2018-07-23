"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function testSimulateSpec(specId, handler) {
    handler(`${specId}: simulate`, s => __1.spec.simulate(specId, s));
}
exports.testSimulateSpec = testSimulateSpec;
//# sourceMappingURL=testSimulateSpec.js.map