"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testLive_1 = require("./testLive");
var testSave_1 = require("./testSave");
var testSimulate_1 = require("./testSimulate");
function testTrio(description, specNameOrHandler, inputHandler) {
    testLive_1.testLive(description, specNameOrHandler, inputHandler);
    testSave_1.testSave(description, specNameOrHandler, inputHandler);
    testSimulate_1.testSimulate(description, specNameOrHandler, inputHandler);
}
exports.testTrio = testTrio;
//# sourceMappingURL=testTrio.js.map