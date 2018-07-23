"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function testSaveSpec(specId, handler) {
    handler(`${specId}: save`, s => __1.spec.save(specId, s));
}
exports.testSaveSpec = testSaveSpec;
//# sourceMappingURL=testSaveSpec.js.map