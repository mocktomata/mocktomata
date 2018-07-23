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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@komondor-lab/core");
var buildUrl_1 = require("./buildUrl");
var getServerInfo_1 = require("./getServerInfo");
function createIOInternal(_a, options) {
    var fetch = _a.fetch, location = _a.location;
    return __awaiter(this, void 0, void 0, function () {
        var info;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getServerInfo_1.getServerInfo({ fetch: fetch, location: location }, options)];
                case 1:
                    info = _b.sent();
                    return [2 /*return*/, {
                            readSpec: function (id) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fetch(buildUrl_1.buildUrl(info.url, "specs/" + id))];
                                            case 1:
                                                response = _a.sent();
                                                if (response.status === 404) {
                                                    throw new core_1.SpecNotFound(id);
                                                }
                                                return [2 /*return*/, response.json()];
                                        }
                                    });
                                });
                            },
                            writeSpec: function (id, record) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fetch(buildUrl_1.buildUrl(info.url, "specs/" + id), { method: 'POST', body: JSON.stringify(record) })
                                                // istanbul ignore next
                                            ];
                                            case 1:
                                                response = _a.sent();
                                                // istanbul ignore next
                                                if (!response.ok) {
                                                    throw new Error("failed to write spec: " + response.statusText);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            readScenario: function (id) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fetch(buildUrl_1.buildUrl(info.url, "scenarios/" + id))];
                                            case 1:
                                                response = _a.sent();
                                                if (response.status === 404) {
                                                    throw new core_1.ScenarioNotFound(id);
                                                }
                                                return [2 /*return*/, response.json()];
                                        }
                                    });
                                });
                            },
                            writeScenario: function (id, record) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fetch(buildUrl_1.buildUrl(info.url, "scenarios/" + id), { method: 'POST', body: JSON.stringify(record) })
                                                // istanbul ignore next
                                            ];
                                            case 1:
                                                response = _a.sent();
                                                // istanbul ignore next
                                                if (!response.ok) {
                                                    throw new Error("failed to write scenario: " + response.statusText);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            getPluginList: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, info.plugins];
                                    });
                                });
                            },
                            loadPlugin: function (name) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, Promise.resolve().then(function () { return __importStar(require(name)); })];
                                    });
                                });
                            },
                        }];
            }
        });
    });
}
exports.createIOInternal = createIOInternal;
//# sourceMappingURL=createIOInternal.js.map