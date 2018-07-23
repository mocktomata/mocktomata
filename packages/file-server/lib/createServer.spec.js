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
var assert_1 = __importDefault(require("assert"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var tmp_1 = require("tmp");
var _1 = require(".");
var io_fs_1 = require("@komondor-lab/io-fs");
test('server defaults to port 3698', function () {
    var server = _1.createServer();
    assert_1.default.strictEqual(server.info.port, 3698);
});
describe('server behavior', function () {
    var tmp = tmp_1.dirSync();
    var repository = io_fs_1.createFileRepository(tmp.name);
    var server = _1.createServer({ port: 3698, repository: repository });
    beforeAll(function () {
        return server.start();
    });
    afterAll(function () {
        return server.stop();
    });
    test('will start of the next port if the preious port is occupied', function () { return __awaiter(_this, void 0, void 0, function () {
        var server2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server2 = _1.createServer();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 5]);
                    return [4 /*yield*/, server2.start()];
                case 2:
                    _a.sent();
                    assert_1.default.strictEqual(server2.info.port, 3699);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, server2.stop()];
                case 4:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('get komondor info', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, actual, pjson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default("http://localhost:" + server.info.port + "/komondor/info")];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    actual = _a.sent();
                    pjson = require('../package.json');
                    assert_1.default.strictEqual(actual, "{\"name\":\"komondor\",\"version\":\"" + pjson.version + "\",\"url\":\"http://localhost:3698\",\"plugins\":[]}");
                    return [2 /*return*/];
            }
        });
    }); });
    test('can read and write spec', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default("http://localhost:" + server.info.port + "/komondor/specs/abc", { method: 'POST', body: '{ a: 1 }' })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_fetch_1.default("http://localhost:" + server.info.port + "/komondor/specs/abc")];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 3:
                    actual = _a.sent();
                    assert_1.default.strictEqual(actual, '{ a: 1 }');
                    return [2 /*return*/];
            }
        });
    }); });
    test('can read and write scenario', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default("http://localhost:" + server.info.port + "/komondor/scenarios/abc", { method: 'POST', body: '{ scen: 1 }' })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_fetch_1.default("http://localhost:" + server.info.port + "/komondor/scenarios/abc")];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 3:
                    actual = _a.sent();
                    assert_1.default.strictEqual(actual, '{ scen: 1 }');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=createServer.spec.js.map