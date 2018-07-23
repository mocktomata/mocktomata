"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
function testLive(description, specNameOrHandler, inputHandler) {
    if (typeof specNameOrHandler === 'string') {
        inputHandler(description + " (with " + specNameOrHandler + "): live", function (s) { return spec_1.spec(specNameOrHandler, s); });
    }
    else {
        specNameOrHandler(description + ": live", function (s) { return spec_1.spec(description, s); });
    }
}
exports.testLive = testLive;
//# sourceMappingURL=testLive.js.map