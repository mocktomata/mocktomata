"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var errors_1 = require("../errors");
var store_1 = require("../store");
/**
 * Load plugins to the system.
 */
function loadPlugins(_a) {
    var io = _a.io;
    return __awaiter(this, void 0, void 0, function () {
        var pluginNames;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, io.getPluginList()];
                case 1:
                    pluginNames = _b.sent();
                    return [2 /*return*/, Promise.all(pluginNames.map(function (name) { return loadPlugin({ io: io }, name); }))];
            }
        });
    });
}
exports.loadPlugins = loadPlugins;
function loadPlugin(_a, moduleName) {
    var io = _a.io;
    return __awaiter(this, void 0, void 0, function () {
        var pluginModule;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tryLoad({ io: io }, moduleName)];
                case 1:
                    pluginModule = _b.sent();
                    assertModuleConfirming(moduleName, pluginModule);
                    pluginModule.activate({
                        register: function (plugin) {
                            assertPluginConfirming(plugin);
                            var pluginName = plugin.name ? moduleName + "/" + plugin.name : moduleName;
                            var plugins = store_1.store.get().plugins;
                            if (plugins.some(function (p) { return p.name === pluginName; })) {
                                throw new errors_1.DuplicatePlugin(pluginName);
                            }
                            plugins.unshift(__assign({}, plugin, { name: pluginName }));
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.loadPlugin = loadPlugin;
function tryLoad(_a, name) {
    var io = _a.io;
    return __awaiter(this, void 0, void 0, function () {
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, io.loadPlugin(name)];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    _b = _c.sent();
                    throw new errors_1.PluginNotFound(name);
                case 3: return [2 /*return*/];
            }
        });
    });
}
function assertModuleConfirming(moduleName, pluginModule) {
    if (typeof pluginModule.activate !== 'function') {
        throw new errors_1.NoActivate(moduleName);
    }
}
function assertPluginConfirming(plugin) {
    if (!plugin ||
        typeof plugin.support !== 'function' ||
        typeof plugin.getSpy !== 'function' ||
        typeof plugin.getStub !== 'function')
        throw new errors_1.PluginNotConforming(plugin.name);
}
//# sourceMappingURL=loadPlugins.js.map