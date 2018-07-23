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
var plugin_1 = require("@komondor-lab/plugin");
var unpartial_1 = require("unpartial");
var errors_1 = require("../errors");
var SpecOptions_1 = require("../SpecOptions");
var InvocationContext_1 = require("./InvocationContext");
var runtime_1 = require("../../runtime");
function createSaveSpec(_a, id, subject, options) {
    var io = _a.io;
    return __awaiter(this, void 0, void 0, function () {
        var o, logger, plugin, actions, context, timeoutHandle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    o = unpartial_1.unpartial(SpecOptions_1.defaultSpecOptions, options);
                    return [4 /*yield*/, runtime_1.ready];
                case 1:
                    logger = (_b.sent()).logger;
                    plugin = plugin_1.findPlugin(subject);
                    if (!plugin) {
                        throw new errors_1.NotSpecable(subject);
                    }
                    actions = [];
                    context = new InvocationContext_1.InvocationContext({ actions: actions, instanceIds: {} }, plugin.name);
                    timeoutHandle = setTimeout(function () {
                        logger.warn("no action for " + o.timeout + " ms. Did you forget to call done()?");
                    }, o.timeout);
                    timeoutHandle.refresh();
                    return [2 /*return*/, {
                            subject: createSpy(context, plugin, subject),
                            done: function () {
                                console.log(actions);
                                return new Promise(function (a) {
                                    a(io.writeSpec(id, { actions: actions }));
                                });
                            }
                        }];
            }
        });
    });
}
exports.createSaveSpec = createSaveSpec;
function createSpy(context, plugin, subject) {
    return plugin.getSpy(context, subject);
}
//# sourceMappingURL=createSaveSpec.js.map