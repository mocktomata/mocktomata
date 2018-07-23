"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var assertron_1 = __importDefault(require("assertron"));
var delay_1 = __importDefault(require("delay"));
var errors_1 = require("../../errors");
var plugin_1 = require("../../plugin");
var setupPluginTest_1 = require("../../setupPluginTest");
var createLiveSpec_1 = require("./createLiveSpec");
var harness;
beforeEach(function () {
    harness = setupPluginTest_1.setupPluginTest('komondor');
});
afterEach(function () {
    harness.reset();
});
describe('timeout warning', function () {
    test("when test did not call done within specified 'timeout', a warning message will be displayed.", function () { return __awaiter(_this, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    harness.io.addPluginModule('dumb', dumbPluginModule);
                    return [4 /*yield*/, plugin_1.loadPlugins(harness)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createLiveSpec_1.createLiveSpec(harness, 'timeout', function () { return true; }, { timeout: 10 })];
                case 2:
                    s = _a.sent();
                    return [4 /*yield*/, delay_1.default(30)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, s.done()];
                case 4:
                    _a.sent();
                    assertron_1.default.satisfies(harness.appender.logs, [{ id: 'komondor', level: 20, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('calling done will stop timeout warning', function () { return __awaiter(_this, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    harness.io.addPluginModule('dumb', dumbPluginModule);
                    return [4 /*yield*/, plugin_1.loadPlugins(harness)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createLiveSpec_1.createLiveSpec(harness, 'timeout', function () { return true; }, { timeout: 10 })];
                case 2:
                    s = _a.sent();
                    return [4 /*yield*/, s.done()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, delay_1.default(30)];
                case 4:
                    _a.sent();
                    assertron_1.default.satisfies(harness.appender.logs, []);
                    return [2 /*return*/];
            }
        });
    }); });
});
test('no suitable plugin throws NotSpecable', function () { return __awaiter(_this, void 0, void 0, function () {
    var spyPlugin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() };
                harness.io.addPluginModule('spy', {
                    activate: function (context) {
                        context.register(spyPlugin);
                    }
                });
                return [4 /*yield*/, plugin_1.loadPlugins(harness)];
            case 1:
                _a.sent();
                spyPlugin.support.mockReturnValue(false);
                return [4 /*yield*/, assertron_1.default.throws(createLiveSpec_1.createLiveSpec(harness, 'no supporting plugin', 'no supporting plugin', { timeout: 300 }), errors_1.NotSpecable)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('supported plugin got getSpy() invoked', function () { return __awaiter(_this, void 0, void 0, function () {
    var spyPlugin, s;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spyPlugin = { support: jest.fn(), getSpy: jest.fn(), getStub: jest.fn() };
                harness.io.addPluginModule('spy', {
                    activate: function (context) {
                        context.register(spyPlugin);
                    }
                });
                return [4 /*yield*/, plugin_1.loadPlugins(harness)];
            case 1:
                _a.sent();
                spyPlugin.support.mockReturnValue(true);
                return [4 /*yield*/, createLiveSpec_1.createLiveSpec(harness, 'call spy', 'call spy', { timeout: 300 })];
            case 2:
                s = _a.sent();
                return [4 /*yield*/, s.done()];
            case 3:
                _a.sent();
                expect(spyPlugin.getSpy.mock.calls.length).toBe(1);
                return [2 /*return*/];
        }
    });
}); });
var dumbPluginModule = {
    activate: function (context) {
        context.register(dumbPlugin);
    }
};
var dumbPlugin = {
    support: function () { return true; },
    getSpy: function () { return undefined; },
    getStub: function () { return undefined; }
};
//# sourceMappingURL=createLiveSpec.spec.js.map