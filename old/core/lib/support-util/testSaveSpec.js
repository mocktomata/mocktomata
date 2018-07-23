"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testSaveSpec(specId, handler) {
    handler(specId + ": save", function (s) { return spec_1.spec.save(specId, s); });
}
exports.testSaveSpec = testSaveSpec;
//# sourceMappingURL=testSaveSpec.js.map