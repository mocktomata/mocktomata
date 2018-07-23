"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const registerPlugin_1 = require("./registerPlugin");
function loadPlugins({ io }, pluginIDs) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(pluginIDs.map((name) => __awaiter(this, void 0, void 0, function* () {
            const m = yield io.loadPlugin(name);
            if (typeof m.activate !== 'function') {
                throw new errors_1.InvalidPlugin(name);
            }
            registerPlugin_1.registerPlugin(m);
        })));
    });
}
exports.loadPlugins = loadPlugins;
//# sourceMappingURL=loadPlugin.js.map