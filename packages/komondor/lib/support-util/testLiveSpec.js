"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function testLiveSpec(specId, handler) {
    handler(`${specId}: live`, s => __1.spec(specId, s));
}
exports.testLiveSpec = testLiveSpec;
//# sourceMappingURL=testLiveSpec.js.map