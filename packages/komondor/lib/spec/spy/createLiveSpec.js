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
const plugin_1 = require("../../plugin");
const errors_1 = require("../errors");
const SpyInvocationContext_1 = require("./SpyInvocationContext");
function createLiveSpec(subject) {
    return __awaiter(this, void 0, void 0, function* () {
        const plugin = plugin_1.findSupportingPlugin(subject);
        if (!plugin) {
            throw new errors_1.NotSpecable(subject);
        }
        const actions = [];
        const context = new SpyInvocationContext_1.SpyInvocationContext({ actions, instanceIds: {} }, plugin.type);
        return {
            subject: createSpy(context, plugin, subject),
            done() {
                return Promise.resolve();
            }
        };
    });
}
exports.createLiveSpec = createLiveSpec;
function createSpy(context, plugin, subject) {
    return plugin.getSpy(context, subject);
}
//# sourceMappingURL=createLiveSpec.js.map