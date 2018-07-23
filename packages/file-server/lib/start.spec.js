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
var io_fs_1 = require("@komondor-lab/io-fs");
var assert_1 = __importDefault(require("assert"));
var assertron_1 = __importDefault(require("assertron"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var tmp_1 = require("tmp");
var _1 = require(".");
var context_1 = require("./context");
test('automatically find a port between 3698 and 3798', function () { return __awaiter(_this, void 0, void 0, function () {
    var server;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _1.start()];
            case 1:
                server = _a.sent();
                expect(server.info.port).toBeGreaterThanOrEqual(3698);
                expect(server.info.port).toBeLessThanOrEqual(3798);
                return [4 /*yield*/, server.stop()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('if a port is specified and not available, will throw an error', function () { return __awaiter(_this, void 0, void 0, function () {
    var runningServer, e;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _1.start()];
            case 1:
                runningServer = _a.sent();
                return [4 /*yield*/, assertron_1.default.throws(_1.start({ port: Number(runningServer.info.port) }))];
            case 2:
                e = _a.sent();
                return [4 /*yield*/, runningServer.stop()];
            case 3:
                _a.sent();
                expect(e.code).toBe('EADDRINUSE');
                return [2 /*return*/];
        }
    });
}); });
describe('server behavior', function () {
    var server;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var tmp, repository;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tmp = tmp_1.dirSync();
                    repository = io_fs_1.createFileRepository(tmp.name);
                    return [4 /*yield*/, repository.writeSpec('exist', '{ "spec": "exist" }')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, repository.writeScenario('exist', '{ "scenario": "exist" }')];
                case 2:
                    _a.sent();
                    context_1.context.get().repository = repository;
                    return [4 /*yield*/, _1.start()];
                case 3:
                    server = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () {
        return server.stop();
    });
    function buildUrl(path) {
        return "http://localhost:" + server.info.port + "/komondor/" + path;
    }
    test('get komondor info', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, actual, pjson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('info'))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    actual = _a.sent();
                    pjson = require('../package.json');
                    assert_1.default.strictEqual(actual, "{\"name\":\"komondor\",\"version\":\"" + pjson.version + "\",\"url\":\"http://localhost:" + server.info.port + "\",\"plugins\":[]}");
                    return [2 /*return*/];
            }
        });
    }); });
    test('read not exist spec gets 404', function () { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('specs/not exist'))];
                case 1:
                    response = _a.sent();
                    expect(response.status).toBe(404);
                    return [2 /*return*/];
            }
        });
    }); });
    test('read spec', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('specs/exist'))];
                case 1:
                    response = _b.sent();
                    expect(response.status).toBe(200);
                    _a = expect;
                    return [4 /*yield*/, response.text()];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toEqual('{ "spec": "exist" }');
                    return [2 /*return*/];
            }
        });
    }); });
    test('write spec', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, repository, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('specs/abc'), { method: 'POST', body: '{ a: 1 }' })];
                case 1:
                    response = _a.sent();
                    expect(response.status).toBe(200);
                    repository = context_1.context.get().repository;
                    return [4 /*yield*/, repository.readSpec('abc')];
                case 2:
                    actual = _a.sent();
                    expect(actual).toEqual('{ a: 1 }');
                    return [2 /*return*/];
            }
        });
    }); });
    test('read not exist scenario gets 404', function () { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('scenarios/not exist'))];
                case 1:
                    response = _a.sent();
                    expect(response.status).toBe(404);
                    return [2 /*return*/];
            }
        });
    }); });
    test('read scenario', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('scenarios/exist'))];
                case 1:
                    response = _b.sent();
                    expect(response.status).toBe(200);
                    _a = expect;
                    return [4 /*yield*/, response.text()];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toEqual('{ "scenario": "exist" }');
                    return [2 /*return*/];
            }
        });
    }); });
    test('write scenario', function () { return __awaiter(_this, void 0, void 0, function () {
        var response, repository, actual;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(buildUrl('scenarios/abc'), { method: 'POST', body: '{ a: 1 }' })];
                case 1:
                    response = _a.sent();
                    expect(response.status).toBe(200);
                    repository = context_1.context.get().repository;
                    return [4 /*yield*/, repository.readScenario('abc')];
                case 2:
                    actual = _a.sent();
                    expect(actual).toEqual('{ a: 1 }');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=start.spec.js.map