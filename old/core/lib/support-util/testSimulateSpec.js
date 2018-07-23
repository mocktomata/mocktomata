"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testSimulateSpec(specId, handler) {
    handler(specId + ": simulate", function (s) { return spec_1.spec.simulate(specId, s); });
}
exports.testSimulateSpec = testSimulateSpec;
//# sourceMappingURL=testSimulateSpec.js.map