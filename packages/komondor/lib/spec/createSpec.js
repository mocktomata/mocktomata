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
const runtime_1 = require("../runtime");
const errors_1 = require("./errors");
const getEffectiveSpecMode_1 = require("./getEffectiveSpecMode");
const simulate_1 = require("./simulate");
const spy_1 = require("./spy");
function createSpec(defaultMode) {
    return (id, subject, options = { timeout: 3000 }) => __awaiter(this, void 0, void 0, function* () {
        const { io, logger } = yield runtime_1.ready;
        assertSpecID(id);
        const mode = getEffectiveSpecMode_1.getEffectiveSpecMode(id, defaultMode);
        switch (mode) {
            case 'live':
                return spy_1.createLiveSpec(subject);
            case 'save':
                return spy_1.createSaveSpec({ io, logger }, id, subject, options);
            case 'simulate':
                return simulate_1.createSimulateSpec({ io }, id, subject);
        }
    });
}
exports.createSpec = createSpec;
function assertSpecID(id) {
    if (id === '')
        throw new errors_1.IDCannotBeEmpty();
}
//# sourceMappingURL=createSpec.js.map