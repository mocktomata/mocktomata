"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testLiveSpec_1 = require("./testLiveSpec");
var testSaveSpec_1 = require("./testSaveSpec");
var testSimulateSpec_1 = require("./testSimulateSpec");
function testTrioSpec(spedId, handler) {
    testLiveSpec_1.testLiveSpec(spedId, handler);
    testSaveSpec_1.testSaveSpec(spedId, handler);
    testSimulateSpec_1.testSimulateSpec(spedId, handler);
}
exports.testTrioSpec = testTrioSpec;
//# sourceMappingURL=testTrioSpec.js.map