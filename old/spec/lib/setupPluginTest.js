"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_util_1 = require("./test-util");
var context_1 = require("./context");
var logging_1 = require("@unional/logging");
var aurelia_logging_memory_1 = require("aurelia-logging-memory");
var store_1 = require("./store");
function setupPluginTest(id) {
    if (id === void 0) { id = 'plugin-test'; }
    var io = test_util_1.createTestIO();
    var log = logging_1.getLogger(id, logging_1.logLevel.debug);
    var appender = new aurelia_logging_memory_1.MemoryAppender();
    logging_1.addAppender(appender);
    context_1.context.set({
        io: io,
        log: log
    });
    store_1.resetStore();
    return {
        io: io,
        log: log,
        appender: appender,
        reset: function () {
            context_1.context.clear();
            logging_1.removeAppender(appender);
        }
    };
}
exports.setupPluginTest = setupPluginTest;
//# sourceMappingURL=setupPluginTest.js.map