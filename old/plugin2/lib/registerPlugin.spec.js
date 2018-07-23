"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assertron_1 = __importDefault(require("assertron"));
var satisfier_1 = require("satisfier");
var _1 = require(".");
var getPlugins_1 = require("./getPlugins");
var dummyPlugin_1 = require("./test-util/dummyPlugin");
var missGetSpyPlugin_1 = require("./test-util/missGetSpyPlugin");
var missGetStubPlugin_1 = require("./test-util/missGetStubPlugin");
var missSupportPlugin_1 = require("./test-util/missSupportPlugin");
var noActivatePluginModule_1 = require("./test-util/noActivatePluginModule");
test('register plugin', function () {
    _1.registerPlugin('dummy', dummyPlugin_1.dummyPluginModule);
    assertron_1.default.satisfies(getPlugins_1.getPlugins(), satisfier_1.some({ name: 'dummy' }));
});
test('registering plugin with the same name throws PluginAlreadyLoaded', function () {
    _1.registerPlugin('same-name', dummyPlugin_1.dummyPluginModule);
    assertron_1.default.throws(function () { return _1.registerPlugin('same-name', dummyPlugin_1.dummyPluginModule); }, _1.PluginAlreadyLoaded);
});
test('plugin without activate function throws not conforming', function () {
    assertron_1.default.throws(function () { return _1.registerPlugin('no-activate', noActivatePluginModule_1.noActivatePluginModule); }, _1.PluginNotConforming);
});
test('plugin missing support method throuws not confirming', function () {
    assertron_1.default.throws(function () { return _1.registerPlugin('miss-support', missSupportPlugin_1.missSupportPluginModule); }, _1.PluginNotConforming);
});
test('plugin missing getSpy method throuws not confirming', function () {
    assertron_1.default.throws(function () { return _1.registerPlugin('miss-getSpy', missGetSpyPlugin_1.missGetSpyPluginModule); }, _1.PluginNotConforming);
});
test('plugin missing getStub method throuws not confirming', function () {
    assertron_1.default.throws(function () { return _1.registerPlugin('miss-getStub', missGetStubPlugin_1.missGetStubPluginModule); }, _1.PluginNotConforming);
});
//# sourceMappingURL=registerPlugin.spec.js.map