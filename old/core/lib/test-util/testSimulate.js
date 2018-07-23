"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testSimulate(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(description + " (with " + specNameOrHandler + "): simulate", function (s) { return spec_1.spec.simulate(specNameOrHandler, s); });
    }
    else {
        specNameOrHandler(description + ": simulate", function (s) { return spec_1.spec.simulate(description, s); });
    }
}
exports.testSimulate = testSimulate;
//# sourceMappingURL=testSimulate.js.map