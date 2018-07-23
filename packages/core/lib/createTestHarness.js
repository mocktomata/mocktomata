"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logging_1 = require("@unional/logging");
var aurelia_logging_color_1 = require("aurelia-logging-color");
var aurelia_logging_memory_1 = require("aurelia-logging-memory");
var type_plus_1 = require("type-plus");
var context_1 = require("./context");
var store_1 = require("./store");
var test_util_1 = require("./test-util");
function createTestHarness(options) {
    var _a = type_plus_1.required({ level: logging_1.logLevel.info, showLog: true }, options), level = _a.level, showLog = _a.showLog;
    var appender = new aurelia_logging_memory_1.MemoryAppender();
    logging_1.addAppender(appender);
    if (showLog)
        logging_1.addAppender(new aurelia_logging_color_1.ColorAppender());
    logging_1.setLevel(level);
    var io = test_util_1.createTestIO();
    context_1.context.set({ io: io });
    store_1.resetStore();
    return {
        io: io,
        appender: appender,
        reset: function () {
            context_1.context.clear();
            logging_1.removeAppender(appender);
        },
        getSpec: function (id) {
            var spec = io.specs[id];
            return JSON.parse(spec);
        },
        logSpecs: function () {
            type_plus_1.forEachKey(io.specs, function (key) {
                console.info(key + ":\n", io.specs[key]);
            });
        }
    };
}
exports.createTestHarness = createTestHarness;
//# sourceMappingURL=createTestHarness.js.map