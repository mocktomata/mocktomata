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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context");
var plugin_1 = require("../plugin");
var createTimeoutWarning_1 = require("./createTimeoutWarning");
var errors_1 = require("./errors");
var getEffectiveSpecMode_1 = require("./getEffectiveSpecMode");
var SpecRecord_1 = require("./SpecRecord");
function createSpec(defaultMode) {
    var _this = this;
    return function (id, subject, options) {
        if (options === void 0) { options = { timeout: 3000 }; }
        return __awaiter(_this, void 0, void 0, function () {
            var io, mode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, context_1.context.get()];
                    case 1:
                        io = (_a.sent()).io;
                        assertSpecID(id);
                        mode = getEffectiveSpecMode_1.getEffectiveSpecMode(id, defaultMode);
                        switch (mode) {
                            case 'auto':
                                return [2 /*return*/, createAutoSpec({ io: io }, id, subject, options)];
                            case 'live':
                                return [2 /*return*/, createLiveSpec({ io: io }, id, subject, options)];
                            case 'save':
                                return [2 /*return*/, createSaveSpec({ io: io }, id, subject, options)];
                            case 'simulate':
                                return [2 /*return*/, createSimulateSpec({ io: io }, id, subject, options)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
}
exports.createSpec = createSpec;
function assertSpecID(id) {
    if (id === '')
        throw new errors_1.IDCannotBeEmpty();
}
function createAutoSpec(context, id, subject, options) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, createSimulateSpec(context, id, subject, options)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_1 = _a.sent();
                    if (e_1 instanceof errors_1.SpecNotFound) {
                        return [2 /*return*/, createSaveSpec(context, id, subject, options)];
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.createAutoSpec = createAutoSpec;
function createLiveSpec(context, id, subject, options) {
    return __awaiter(this, void 0, void 0, function () {
        var recorder;
        return __generator(this, function (_a) {
            recorder = createRecorder(context, id, options);
            return [2 /*return*/, {
                    subject: recorder.getSpy(subject),
                    done: function () {
                        return recorder.end();
                    }
                }];
        });
    });
}
exports.createLiveSpec = createLiveSpec;
function createSaveSpec(context, id, subject, options) {
    return __awaiter(this, void 0, void 0, function () {
        var recorder;
        return __generator(this, function (_a) {
            recorder = createRecorder(context, id, options);
            return [2 /*return*/, {
                    subject: recorder.getSpy(subject),
                    done: function () {
                        return recorder.save();
                    }
                }];
        });
    });
}
exports.createSaveSpec = createSaveSpec;
function createSimulateSpec(context, id, subject, options) {
    return __awaiter(this, void 0, void 0, function () {
        var player;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createPlayer(context, id, subject, options)];
                case 1:
                    player = _a.sent();
                    return [2 /*return*/, {
                            subject: player.stub,
                            done: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/, player.end()];
                                    });
                                });
                            }
                        }];
            }
        });
    });
}
exports.createSimulateSpec = createSimulateSpec;
function createRecorder(context, id, options) {
    var record = { refs: [], actions: [] };
    var recordTracker = SpecRecord_1.createSpecRecordTracker(record);
    var idleWarning = createTimeoutWarning_1.createTimeoutWarning(options.timeout);
    return {
        getSpy: function (subject) {
            if (typeof subject === 'string')
                throw new errors_1.NotSpecable(subject);
            try {
                return getSpy(recordTracker, subject);
            }
            catch (e) {
                idleWarning.stop();
                throw e;
            }
        },
        end: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    idleWarning.stop();
                    return [2 /*return*/];
                });
            });
        },
        save: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.end()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, context.io.writeSpec(id, makeSerializable(record))];
                    }
                });
            });
        }
    };
}
function getSpy(recordTracker, subject, source) {
    var plugin = plugin_1.findPlugin(subject);
    if (!plugin)
        throw new errors_1.NotSpecable(subject);
    var spyContext = createSpyContext(recordTracker, plugin, subject);
    var spy = plugin.getSpy(spyContext, subject);
    return spy;
}
function createSpyContext(recordTracker, plugin, subject) {
    return {
        newSpyRecorder: function (spy, meta) {
            var ref = recordTracker.getReference(plugin.name, spy);
            return {
                construct: function (args) {
                    recordTracker.addAction({
                        type: 'construct',
                        payload: args,
                        ref: ref
                    });
                    return {};
                },
                /**
                 * @param target The scope. This is usually the stub.
                 */
                invoke: function (args) {
                    if (args === void 0) { args = []; }
                    var spiedArgs = args.map(function (arg, i) { return getSpy(recordTracker, arg, { ref: ref, site: [i] }); });
                    recordTracker.invoke(ref, spiedArgs);
                    return {
                        spiedArgs: spiedArgs,
                        return: function (result) {
                            var spiedResult = getSpy(recordTracker, result);
                            recordTracker.return(ref, spiedResult);
                            return spiedResult;
                        },
                        throw: function (error) {
                            var spiedError = getSpy(recordTracker, error);
                            recordTracker.throw(ref, spiedError);
                            return spiedError;
                        }
                    };
                },
                get: function (target, prop) {
                    return {};
                },
                set: function (target, prop, value) {
                    return {};
                }
            };
        }
    };
}
function makeSerializable(record) {
    return record;
}
function createPlayer(context, id, subject, options) {
    return __awaiter(this, void 0, void 0, function () {
        var plugin, record, actual, recordValidator, stubContext, stub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof subject === 'string')
                        throw new errors_1.NotSpecable(subject);
                    plugin = plugin_1.findPlugin(subject);
                    if (!plugin)
                        throw new errors_1.NotSpecable(subject);
                    record = { refs: [], actions: [] };
                    return [4 /*yield*/, context.io.readSpec(id)];
                case 1:
                    actual = _a.sent();
                    recordValidator = SpecRecord_1.createSpecRecordValidator(id, actual, record);
                    stubContext = createStubContext(recordValidator, plugin, subject);
                    stub = plugin.getStub(stubContext, subject);
                    return [2 /*return*/, {
                            stub: stub,
                            end: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        return [2 /*return*/];
                                    });
                                });
                            }
                        }];
            }
        });
    });
}
function createStubContext(recordValidator, plugin, subject) {
    return {
        newStubRecorder: function (stub, meta) {
            var ref = recordValidator.getReference(plugin.name, stub);
            return {
                invoke: function (args) {
                    if (args === void 0) { args = []; }
                    var spiedArgs = args.map(function (arg) { return getSpy(recordValidator, arg); });
                    recordValidator.invoke(ref, spiedArgs);
                    // TODO process until ready
                    return {
                        succeed: function () {
                            return recordValidator.succeed();
                        },
                        result: function () {
                            return recordValidator.result();
                        }
                    };
                }
            };
        }
    };
}
//# sourceMappingURL=createSpec.js.map