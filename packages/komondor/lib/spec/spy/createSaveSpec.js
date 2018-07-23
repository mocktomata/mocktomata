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
const unpartial_1 = require("unpartial");
const plugin_1 = require("../../plugin");
const errors_1 = require("../errors");
const SpecOptions_1 = require("../SpecOptions");
const SpyInvocationContext_1 = require("./SpyInvocationContext");
function createSaveSpec({ io, logger }, id, subject, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const o = unpartial_1.unpartial(SpecOptions_1.defaultSpecOptions, options);
        const plugin = plugin_1.findSupportingPlugin(subject);
        if (!plugin) {
            throw new errors_1.NotSpecable(subject);
        }
        const actions = [];
        const context = new SpyInvocationContext_1.SpyInvocationContext({ actions, instanceIds: {} }, plugin.type);
        const timeoutHandle = setTimeout(() => {
            logger.warn(`no action for ${o.timeout} ms. Did you forget to call done()?`);
        }, o.timeout);
        timeoutHandle.refresh();
        return {
            subject: createSpy(context, plugin, subject),
            done() {
                return new Promise(a => {
                    a(io.writeSpec(id, { actions }));
                });
            }
        };
    });
}
exports.createSaveSpec = createSaveSpec;
function createSpy(context, plugin, subject) {
    return plugin.getSpy(context, subject);
}
//# sourceMappingURL=createSaveSpec.js.map