"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testLiveSpec(specId, handler) {
    handler(specId + ": live", function (s) { return spec_1.spec(specId, s); });
}
exports.testLiveSpec = testLiveSpec;
//# sourceMappingURL=testLiveSpec.js.map