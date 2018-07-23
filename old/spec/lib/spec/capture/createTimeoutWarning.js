"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createTimeoutWarning(log, timeout) {
    var timeoutHandle = setTimeout(function () {
        log.warn("done() was not called in " + timeout + " ms. Did the test takes longer than expected or you forget to call done()?");
    }, timeout);
    return { stop: function () { clearTimeout(timeoutHandle); } };
}
exports.createTimeoutWarning = createTimeoutWarning;
//# sourceMappingURL=createTimeoutWarning.js.map