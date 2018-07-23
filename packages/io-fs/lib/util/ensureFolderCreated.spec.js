"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var tmp_1 = require("tmp");
var ensureFolderCreated_1 = require("./ensureFolderCreated");
test('folder exists does nothing', function () {
    var tmp = tmp_1.dirSync();
    var dir = path_1.default.join(tmp.name, 'some-folder');
    fs_1.default.mkdirSync(dir);
    fs_1.default.writeFileSync(path_1.default.join(dir, 'x'), 'abc');
    ensureFolderCreated_1.ensureFolderCreated(dir);
    var actual = fs_1.default.readdirSync(dir);
    assert_1.default.strictEqual(actual[0], 'x');
});
test('create folder if not exist', function () {
    var tmp = tmp_1.dirSync();
    var dir = path_1.default.join(tmp.name, 'some-folder');
    ensureFolderCreated_1.ensureFolderCreated(dir);
    var actual = fs_1.default.readdirSync(tmp.name);
    assert_1.default.strictEqual(actual[0], 'some-folder');
});
//# sourceMappingURL=ensureFolderCreated.spec.js.map