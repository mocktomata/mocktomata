"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("../common");
function createTimeoutWarning(timeout) {
    var timeoutHandle = setTimeout(function () {
        common_1.log.warn("done() was not called in " + timeout + " ms. Did the test takes longer than expected or you forget to call done()?");
    }, timeout);
    return { stop: function () { clearTimeout(timeoutHandle); } };
}
exports.createTimeoutWarning = createTimeoutWarning;
//# sourceMappingURL=createTimeoutWarning.js.map