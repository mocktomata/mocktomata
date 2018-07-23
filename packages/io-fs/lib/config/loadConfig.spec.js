"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var assertron_1 = __importDefault(require("assertron"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var tmp_1 = require("tmp");
var loadConfig_1 = require("./loadConfig");
var _1 = require(".");
test('no config returns empty object', function () {
    var tmp = tmp_1.dirSync();
    var actual = loadConfig_1.loadConfig(tmp.name);
    assert_1.default.deepStrictEqual(actual, {});
});
test('load from package.json', function () {
    var tmp = tmp_1.dirSync();
    var expected = { url: 'http://localhost' };
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, 'package.json'), JSON.stringify({ komondor: expected }));
    var actual = loadConfig_1.loadConfig(tmp.name);
    assert_1.default.deepStrictEqual(actual, expected);
});
test('load from .komondor.json', function () {
    var tmp = tmp_1.dirSync();
    var expected = { url: 'http://localhost' };
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.json'), JSON.stringify(expected));
    var actual = loadConfig_1.loadConfig(tmp.name);
    assert_1.default.deepStrictEqual(actual, expected);
});
test('if .komondor.json is not a valid json, throws InvalidConfigFormat', function () {
    var tmp = tmp_1.dirSync();
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.json'), '');
    assertron_1.default.throws(function () { return loadConfig_1.loadConfig(tmp.name); }, _1.InvalidConfigFormat);
});
test('if .komondor.js is not a valid js, throws InvalidConfigFormat', function () {
    var tmp = tmp_1.dirSync();
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.js'), 'abc def');
    assertron_1.default.throws(function () { return loadConfig_1.loadConfig(tmp.name); }, _1.InvalidConfigFormat);
});
test('if both .komondor.json and .komondor.js exist, throws AmbiguousConfig', function () {
    var tmp = tmp_1.dirSync();
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.json'), '{}');
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.js'), 'module.exports={}');
    assertron_1.default.throws(function () { return loadConfig_1.loadConfig(tmp.name); }, _1.AmbiguousConfig);
});
test('if both package.json/komondor and .komondor.json, throws AmbiguousConfig', function () {
    var tmp = tmp_1.dirSync();
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, 'package.json'), '{ "komondor": {} }');
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.json'), '{}');
    assertron_1.default.throws(function () { return loadConfig_1.loadConfig(tmp.name); }, _1.AmbiguousConfig);
});
test('if both package.json/komondor and .komondor.json, throws AmbiguousConfig', function () {
    var tmp = tmp_1.dirSync();
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, 'package.json'), '{ "komondor": {} }');
    fs_1.default.writeFileSync(path_1.default.join(tmp.name, '.komondor.js'), 'module.exports={}');
    assertron_1.default.throws(function () { return loadConfig_1.loadConfig(tmp.name); }, _1.AmbiguousConfig);
});
//# sourceMappingURL=loadConfig.spec.js.map