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
var logging_1 = require("@unional/logging");
var assertron_1 = __importDefault(require("assertron"));
var delay_1 = __importDefault(require("delay"));
var __1 = require("..");
var createRecorder_1 = require("./createRecorder");
var specOptions = { timeout: 30 };
describe('timeout warning', function () {
    var harness;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            harness = __1.createTestHarness({ showLog: false });
            return [2 /*return*/];
        });
    }); });
    afterEach(function () { return harness.reset(); });
    test("log a warning message if stop() was not called within specified 'timeout'.", function () { return __awaiter(_this, void 0, void 0, function () {
        var recorder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    recorder = createRecorder_1.createRecorder(harness, 'timeout', { timeout: 10 });
                    return [4 /*yield*/, delay_1.default(30)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, recorder.end()];
                case 2:
                    _a.sent();
                    assertron_1.default.satisfies(harness.appender.logs, [{ id: 'komondor', level: logging_1.logLevel.warn, messages: ['done() was not called in 10 ms. Did the test takes longer than expected or you forget to call done()?'] }]);
                    return [2 /*return*/];
            }
        });
    }); });
    test("not log warning message if stop() is called before the specified 'timeout'.", function () { return __awaiter(_this, void 0, void 0, function () {
        var recorder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    recorder = createRecorder_1.createRecorder(harness, 'timeout', { timeout: 10 });
                    return [4 /*yield*/, recorder.end()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, delay_1.default(30)];
                case 2:
                    _a.sent();
                    assertron_1.default.satisfies(harness.appender.logs, []);
                    return [2 /*return*/];
            }
        });
    }); });
    test("not log warning message if save() is called before the specified 'timeout'.", function () { return __awaiter(_this, void 0, void 0, function () {
        var recorder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    recorder = createRecorder_1.createRecorder(harness, 'timeout', { timeout: 10 });
                    return [4 /*yield*/, recorder.save()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, delay_1.default(30)];
                case 2:
                    _a.sent();
                    assertron_1.default.satisfies(harness.appender.logs, []);
                    return [2 /*return*/];
            }
        });
    }); });
});
test('getSpy() on non-string primitives throw NotSpecable', function () {
    var harness = __1.createTestHarness();
    var recorder = createRecorder_1.createRecorder(harness, 'throw not specable', specOptions);
    assertron_1.default.throws(function () { return recorder.getSpy(undefined); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return recorder.getSpy(null); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return recorder.getSpy(1); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return recorder.getSpy(true); }, __1.NotSpecable);
    assertron_1.default.throws(function () { return recorder.getSpy(Symbol()); }, __1.NotSpecable);
});
// const specRecord = {
//   refs: {
//     '1': {
//       plugin: 'es5/function',
//       subjectId: 1,
//       invokeId: 1
//       // no value means it is from real time
//     },
//     '2': {
//       plugin: 'es5/error',
//       value: { message: 'abc' }
//     },
//     '3': {
//       plugin: 'es5/string',
//       value: 'actual string'
//     },
//     '4': {
//       plugin: 'es2015/symbol',
//       value: 'get from input or create in real time'
//     },
//     '5': {
//       plugin: 'es5/function',
//       value: 'from real time'
//     }
//   },
//   actions: [
//     { type: 'invoke', payload: ['2', '4'], ref: '1' },
//     { type: 'invoke', payload: [], ref: '4' }
//   ]
// }
//# sourceMappingURL=createRecorder.spec.js.map