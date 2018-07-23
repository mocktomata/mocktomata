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
Object.defineProperty(exports, "__esModule", { value: true });
var boom_1 = __importDefault(require("boom"));
var hapi_1 = require("hapi");
var path_1 = __importDefault(require("path"));
var unpartial_1 = require("unpartial");
var context_1 = require("./context");
function start(options) {
    return __awaiter(this, void 0, void 0, function () {
        var o, server, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    o = unpartial_1.required({}, options);
                    if (!o.port) return [3 /*break*/, 1];
                    _a = new hapi_1.Server({ port: o.port, routes: { 'cors': true } });
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, tryCreateHapi(3698, 3698, 3708)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    server = _a;
                    defineRoutes(server);
                    return [4 /*yield*/, server.start()];
                case 4:
                    _b.sent();
                    return [2 /*return*/, {
                            info: server.info,
                            stop: function (options) {
                                return server.stop(options);
                            }
                        }];
            }
        });
    });
}
exports.start = start;
function tryCreateHapi(port, start, end) {
    return __awaiter(this, void 0, void 0, function () {
        var server, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // istanbul ignore next
                    if (port > end) {
                        throw new Error("Unable to start komondor server using port from " + start + " to " + end);
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    server = new hapi_1.Server({ port: port, routes: { 'cors': true } });
                    return [4 /*yield*/, server.start()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, server.stop()];
                case 3:
                    _b.sent();
                    return [2 /*return*/, server];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, tryCreateHapi(port + 1, start, end)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function defineRoutes(server) {
    var _this = this;
    server.route([
        {
            method: 'GET',
            path: '/komondor/info',
            handler: function (request) { return __awaiter(_this, void 0, void 0, function () {
                var pjson, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            pjson = require(path_1.default.resolve(__dirname, '../package.json'));
                            _b = (_a = JSON).stringify;
                            _c = {
                                name: 'komondor',
                                version: pjson.version,
                                url: getReflectiveUrl(request.info, server.info)
                            };
                            return [4 /*yield*/, context_1.context.get().repository.getPluginList()];
                        case 1: return [2 /*return*/, _b.apply(_a, [(_c.plugins = _d.sent(),
                                    _c)])];
                    }
                });
            }); }
        },
        // {
        //   method: 'GET',
        //   path: '/komondor/config',
        //   options: { cors: true },
        //   handler: async (request, h) => {
        //     return JSON.stringify(loadConfig(cwd))
        //   }
        // },
        {
            method: 'GET',
            path: '/komondor/specs/{id}',
            handler: function (request) { return __awaiter(_this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, context_1.context.get().repository.readSpec(request.params.id)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_1 = _a.sent();
                            throw boom_1.default.notFound(e_1.message);
                        case 3: return [2 /*return*/];
                    }
                });
            }); }
        },
        {
            method: 'POST',
            path: '/komondor/specs/{id}',
            handler: function (request, h) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context_1.context.get().repository.writeSpec(request.params.id, request.payload)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, h.response()];
                    }
                });
            }); }
        },
        {
            method: 'GET',
            path: '/komondor/scenarios/{id}',
            handler: function (request) { return __awaiter(_this, void 0, void 0, function () {
                var e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, context_1.context.get().repository.readScenario(request.params.id)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_2 = _a.sent();
                            throw boom_1.default.notFound(e_2.message);
                        case 3: return [2 /*return*/];
                    }
                });
            }); }
        },
        {
            method: 'POST',
            path: '/komondor/scenarios/{id}',
            handler: function (request, h) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, context_1.context.get().repository.writeScenario(request.params.id, request.payload)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, h.response()];
                    }
                });
            }); }
        }
    ]);
}
/**
 * If request is calling from local, return as localhost.
 */
function getReflectiveUrl(requestInfo, serverInfo) {
    if (requestInfo.remoteAddress === '127.0.0.1') {
        return serverInfo.protocol + "://localhost:" + serverInfo.port;
    }
    // istanbul ignore next
    return serverInfo.uri;
}
//# sourceMappingURL=start.js.map