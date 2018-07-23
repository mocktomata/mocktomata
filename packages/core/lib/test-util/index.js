"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("../spec");
__export(require("./createTestIO"));
__export(require("./ensure"));
__export(require("./missGetSpyPlugin"));
__export(require("./missGetStubPlugin"));
__export(require("./missSupportPlugin"));
__export(require("./noActivatePluginModule"));
__export(require("./plugins"));
function testTrio(description, handler) {
    testLive(description, handler);
    testSave(description, handler);
    testSimulate(description, handler);
}
exports.testTrio = testTrio;
function testLive(description, handler) {
    handler(description + ": live", function (s) { return spec_1.spec.live(description, s); });
}
exports.testLive = testLive;
function testSave(description, handler) {
    handler(description + ": save", function (s) { return spec_1.spec.save(description, s); });
}
exports.testSave = testSave;
function testSimulate(description, handler) {
    handler(description + ": simulate", function (s) { return spec_1.spec.simulate(description, s); });
}
exports.testSimulate = testSimulate;
var komondorTest = {
    live: testLive,
    save: testSave,
    simulate: testSimulate,
    trio: testTrio
};
exports.default = komondorTest;
//# sourceMappingURL=index.js.map