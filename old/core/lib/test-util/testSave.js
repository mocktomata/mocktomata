"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testSave(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(description + " (with " + specNameOrHandler + "): save", function (s) { return spec_1.spec.save(specNameOrHandler, s); });
    }
    else {
        specNameOrHandler(description + ": save", function (s) { return spec_1.spec.save(description, s); });
    }
}
exports.testSave = testSave;
//# sourceMappingURL=testSave.js.map