"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assertron_1 = __importDefault(require("assertron"));
var __1 = require("..");
var createPlayer_1 = require("./createPlayer");
var specOptions = { timeout: 30 };
test('getStub() on non-string primitives throw NotSpecable', function () {
    var harness = __1.createTestHarness();
    var player = createPlayer_1.createPlayer(harness, 'throw not specable', specOptions);
    assertron_1.default.throws(function () { return player.getStub(undefined); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return player.getStub(null); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return player.getStub(1); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return player.getStub(true); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return player.getStub(Symbol()); }, __1.NotSpecable);
});
//# sourceMappingURL=createPlayer.spec.js.map